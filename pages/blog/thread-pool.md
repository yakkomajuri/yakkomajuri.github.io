---
template: blog
---

# Deep diving into the thread pool: a debugging story

Some months ago I found myself with the following issue in my sprint priorities:

["BigQuery is very flakey on local / self-hosted"](https://github.com/PostHog/bigquery-plugin/issues/10)

Keeping context to a minimum, we run an open source analytics platform that you can self-host, and there are plugins to help you send data out of the platform and into other tools, of which BigQuery is one of them.

Now, two weeks or so before the sprint at hand, a customer who was using the BigQuery plugin on their self-hosted instance reported seeing a lot of errors on the plugin's logs, saying something about execution having timed out.

Plugins can run tasks that last up to 30 seconds at a time, and it seemed inserts to BigQuery were taking more than that to complete.

Even worse, it seemed that somehow some inserts were succeeding despite throwing the error, which caused us to export duplicates as our retry logic was triggered.

Plus, to top it off, this was reportedly happening on local Postgres-backed deployments and self-hosted ClickHouse-backed instances, but not on our ClickHouse-backed Cloud instance. What?

And so, back to my sprint goals. Having read all the context I could find, it seemed the consensus until now was that BigQuery was at fault here.

However, I was a bit skeptical. I had been working on building plugins, and just the week before I had encountered similar cryptic errors while working on another plugin.

I originally shrugged them off, but the light bulb went on as soon as I read the issue about the BigQuery plugin.

Something deeper was going on.

## The util shuffle

While the BigQuery plugin didn't seem to be the only one affected, it could potentially give me some insight into what's happening.

I started running it while inspecting the code, and something quickly became clear: we'd regularly throw errors on the first insert attempt, but never on retries.

What could be different here?

Bingo! The buffer.

Our plugins have a few options when it comes to asynchronous processing, primarily the jobs API and the buffer util.

The BigQuery plugin used the buffer on the first insert attempt, but leveraged jobs (another API) to process retries.

Given that the problem seemed to only occur on the first run, it seemed that the buffer was to blame.

## Beyond a reasonable doubt

Ok, so the buffer seemed to be the problem, but this needed to be confirmed.

As such, I setup a plugin that used both a buffer and a job to call the same async function that made a request to an endpoint that'd always wait 5s before responding, and timed the performance of the two.

The job always executed in around the same amount of time, but the buffer would vary a lot:

![logs](https://user-images.githubusercontent.com/38760734/123464398-1efa6f00-d5c3-11eb-86a4-612fd36d0d3a.png)

I went through thousands of runs, and the job was always consistent. The buffer would vary from 5s to 29s and then came the timeouts.

So the buffer was the problem. But finding out why was where my beard hairs started to come out.

I started to notice connection reset, socket hang up, and other sorts of errors. I knew the request would only take 5s, so there were 25s to spare. This made no sense, and so my hunch was that this a problem lower down.

## 🔥

At this point I spent hours looking a Node.js and Piscina (our thread pool) docs and testing out different config options, but I wasn't going anywhere.

So finally I decided to run the plugin server with a flamegraph tool called [0x](https://github.com/davidmarkclements/0x).

And _that_ looked like _this_:

![flamegraph](https://user-images.githubusercontent.com/38760734/123465219-3a19ae80-d5c4-11eb-857c-588c31a33262.png)

Hm, what's `atomicsWaitLoop`?

I went to the Piscina repo and there was the answer:

```js
function atomicsWaitLoop (port : MessagePort, sharedBuffer : Int32Array) {
  if (!useAtomics) return;

  // This function is entered either after receiving the startup message, or
  // when we are done with a task. In those situations, the *only* thing we
  // expect to happen next is a 'message' on `port`.
  // That call would come with the overhead of a C++ → JS boundary crossing,
  // including async tracking. So, instead, if there is no task currently
  // running, we wait for a signal from the parent thread using Atomics.wait(),
  // and read the message from the port instead of generating an event,
  // in order to avoid that overhead.
  // The one catch is that this stops asynchronous operations that are still
  // running from proceeding. Generally, tasks should not spawn asynchronous
  // operations without waiting for them to finish, though.

  ...
}
```

Oh.

> "Generally, tasks should not spawn asynchronous operations without waiting for them to finish, though."

That's exactly what the buffer does!

So we were doing something our thread pool recommended against. That probably was it. But we did this across the board! How come this error didn't happen on Cloud but happened on self-hosted instances?

As it turns out, the error _did_ happen on Cloud, but very infrequently. It was also merged in with other legitimate timeouts on Sentry, which made it hard to spot.

But that still wasn't it. What is _really_ happening and how can we fix it?

## Never block the event loop

The golden rule in the JavaScript ecosystem is ["don't block the event loop"](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/).

The event loop is JavaScript's approach to asynchronous operations in a single-threaded environment.

It is much better explained by [others](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/), so I'll refrain from covering it here.

As it turns out, in order to improve performance around the communication between the main thread and the worker threads, Piscina defaults to running a (potentially infinite) while loop that proactively looks for new tasks for the worker on a specified port, rather than waiting for the callback triggered by listening for new messages.

As a result, while Piscina is checking for new messages, it blocks the event loop, so nothing else gets done.

And, given we have set timeouts for our tasks to execute, if a worker is blocking for more than 30 seconds, once it is free again for other processing, it goes to handle the callbacks from our task, but at this point we force the timeout.

Now, this only happens with _voided promises_. Promises that are explicitly voided (i.e. not awaited) in order to be processed "in the background", where the result is not important. If a promise is awaited, the task is not marked as complete as long as the promise is not done, and thus the worker doesn't get into the blocked state to look for new tasks.

Concretely, here's an example scenario:

1. PostHog receives an event
2. This event is passed to a plugin for processing
3. This plugin voids a promise sending a POST request to BigQuery with the event
4. The worker marks the task as complete and goes on to look for new tasks
5. The event loop is blocked for 45 seconds
6. A new event comes in, and a new task is picked up
7. When it gets a chance, the event loop tries to handle the callback from the voided promise
8. As it goes to handle the callback from the request, our wrapper forces a timeout and the plugin errors (despite the request having completed successfully)
9. Our retry logic was triggered and the event was exported twice

## When the lack of load is the problem

Now, the reason this affected our clients' instances more than our Cloud instance is because the Piscina worker will only block the event loop when it is looking for new tasks. If it is processing a task, it will be able to handle the background callbacks and such normally.

So, while on Cloud we process hundreds of thousands of events per minute, with each event potentially triggering multiple tasks, some of our clients could feasibly go 30 seconds without a worker receiving a task, thus triggering this issue.

This is tricky, because upon seeing something like a timeout error, you might think you should scale _up_, as is the solution for other similar issues we have faced that cause timeouts.

However, if you scale vertically, we'll add more threads to the plugin server - the default setting is `n(threads) == n(cpus)` - and if you scale horizontally, we'll also be running more worker threads.

As such, you're increasing the chance that a given worker will have to wait 30 or more seconds for a task.

The (temporary) answer here would actually be to scale _down_.

## The solution

So, the client could scale down to potentially mitigate this problem, but that's certainly not a good solution.

But how did we _fix_ this?

Well, one thing we could have done was get rid of voided promises altogether. However, the benefit they bring us in performance is significant.

As such, we started to brainstorm on approaches that would allow us to keep the voided promises.

The first attempt was very straightforward. Piscina provides a `useAtomics` flag that can be used to disable the blocking mechanism instead of the slower approach of waiting for the signal denoting a new message.

Upon benchmarking this with our system, however, I found that our event ingestion rate [slowed down by around 27%](https://github.com/PostHog/plugin-server/issues/487#issuecomment-870509629) when `useAtomics` was set to `false`. This is an unacceptable performance drop, so we scrapped the idea.

Thus, after toying with a few other ideas, we landed on the following (note that we were already running a _fork_ of Piscina):

**Introduce a setting denoting a maximum amount of time a worker should block the event loop while looking for tasks before falling back into the slower mechanism. ([Implementation](https://github.com/PostHog/piscina/pull/4))**

Sensible defaults were then set for our Cloud and self-hosted instances (originally 1s and 5s respectively).

> _Note that we've forked Piscina in order to tailor it to our very specific needs. This isn't a general solution but was a good fit for us._

The reason this works is because on our Cloud instance, where performance is paramount, most of the time workers will get a new task in fractions of a second, so the absolute vast majority of tasks will be picked up using the fast mechanism.

However, on self-hosted instances processing low volumes, if workers are already taking e.g. 5 seconds to get a new task, the load on the instance is so little that the performance hit won't be problematic, since it is unlikely it will lead to a long backlog of tasks.

And so, that's how we kept our performance intact without touching the voided promises.

---

_[Here's the original ticket](https://github.com/PostHog/plugin-server/issues/487) where this was explained and a discussion about possibilities took place_.
