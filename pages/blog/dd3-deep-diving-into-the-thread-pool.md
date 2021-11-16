---
template: blog
---

# Debugging Debrief #2: Deep diving into the thread pool

> <small>This piece is a part of my _Debugging Debrief_ series, which includes writeups of tracking down and fixing bugs. My goal is that this series motivates me to write about software more often, so I can kick back into the habit, reinforce my learnings through the writing, and refer back to these posts in the future.</small>

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

The BigQuery plugin used the buffer on the first insert attempt, but leveraged jobs to process retries.

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

w
I went to the Piscina repo and there was the answer:

```
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

So we were doing something our thread pool recommended against. That probably was it. But we did this across the board! How come this error didn't happen on Cloud but happened on self-hosted.

As it turns out, the error _did_ happen on Cloud, but very infrequently. It was also merged in with other legitimate timeouts on Sentry, which made it hard to spot.

But that still wasn't it. What is _really_ happening and how can we fix it? 

## Never block the event loop

The golden rule in the JavaScript ecosystem is ["don't block the event loop"](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/).

The event loop is JavaScript's approach to asynchronous operations in a single-threaded environment. 

It is much better explained by [others](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/), so I'll refrain from covering it here.


