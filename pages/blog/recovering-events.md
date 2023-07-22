---
template: blog
---

# Recovering a customer's events

Here's a short post of a recent occurence just to get kickback into the habit about documenting debugging sessions and writing about software in general. Hopefully I'll cover some nastier stuff in upcoming pieces.

Just the other day I had a session booked in my calendar that was gearing up to be painful.

A customer who deployed our software had found out an important piece of their instance had started having some issues _a while back_, so they hadn't ingested any events (data) for about a month.

Leaving aside the details regarding why this happened and why it wasn't noticed earlier, what then happened is that we realized the customer still had a good amount of the data in Kafka (~10 days worth) and they wanted to restore it.

Enter me. I was the one who would help them restore this data - meaning I'd jump on a call with an engineer from their side and figure this out.

The reason this is painful is that you can't just move fast and run commands yourself to try things out. You have to convey to the person on the other side of the screen, accurately, what should be done next.

"Now run '_cube control config use context_'. Oh sorry, that's '_use context_' with an underscore, I mean dash. Argh!"

Anyway, we got started and the approach seemed clear.

For anyone else that is not future me reading this post, I'll provide just a bit of context.

Our product runs two key servers. The first one I'll call the Django server, and the second is called the plugin server.

The plugin server, however, is not just that. In reality, it's more like "the ingestion server". So, to ingest data, an endpoint is hit on the Django server, which does a bit of validation on the payload, and then pops it into Kafka.

The plugin server then picks up the event (payload), does some processing on it, updates state where relevant, and pops the event _back_ into Kafka, where it's consumed by ClickHouse (our database) using a Kafka engine.

Diagramatically:

```
# flow of an event through the system
-> django server -> kafka (topic 1) -> plugin server -> kafka (topic 2) -> clickhouse
```

So, what happened to the customer is that their plugin server had ran into a bug, so the data we had to restore was from 'topic 1' in the diagram above.

Someone else from our team had originally touched base first, and suggested that they dump the Kafka data somewhere safe from eviction by Kafka's retention policy.

Thus, today, we'd recover that data.

The approach was to just produce the data again to topic 1, and our system would just process it correctly from there.

We get started and the engineer shows me the data dump. The messages were there intact, but the file also included a bunch of metadata, structured in a format that's great for humans to read, but not great to easily pipe into a Kafka producer.

As such, we spent some time writing up a regex to clean it up (note to self: get better at this), until we had got the file to a point where it was in a JSONL format.

The engineer's tool of choice for dealing with Kafka was `kafkacat`, and a brief scan of their docs showed me that if we had a JSONL file, `kafkacat` would produce messages from that data with ease.

Having gotten the file formatted how we wanted it, we scanned it through and found no issues, so we proceeded to produce the messages through `kafkacat` connected to the Kafka service via k8s port forwarding.

Looking good, looking good. Bam!

_Unexpected end of JSON input!_

The plugin server crashed.

We scale the plugins service pod down and up again, and it crashes once more.

This is strange - the plugin server does a lot in worker threads, and an exception thrown in those wouldn't normally cause the server to crash. It also generally has pretty good error handling. Plus, why can't it even start up again?

Making a short story shorter, turns out exactly _one_ of the JSON payloads was invalid, and the plugin server runs the Kafka consumer in the main thread, from where it distributes the ingestion work to the workers.

And while this is a service that's reasonably resilient, it didn't handle the case where a payload from Kafka contained invalid JSON. This is usually fine because that topic is only produced to from the Django server, which _does do_ JSON validation. However, when one produces to the topic directly, that validation is bypassed.

So now the Kafka topic is poisoned, and the plugin server won't start back up, since it can't commit the offset for the consumer group, and tries to consume the same message each time it starts up.

Ultimately, we found the invalid payload with a little Python script, and exec'd into the Kafka pod to manually move the consumer group offset forward.

With the offset now beyond the broken payload, the service got healthy again, and we were able to produce the data with no problems.

Any potential duplicates produced would be handled by the table engine and collapsed appropriately based on the payload UUIDs.

That was that. The customer got their data back and we moved on with our days.

---

Lessons:

- Get better at regex
- Always add handling for invalid payloads
