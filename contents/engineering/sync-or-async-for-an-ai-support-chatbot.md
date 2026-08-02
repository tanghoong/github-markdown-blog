---
title: Sync or async for an AI support chatbot
date: 2026-08-02
tags: [AI Agents, System Architecture, Backend Engineering, LLM]
excerpt: If customer A is waiting for the LLM, does customer B have to wait too? The answer is an architecture decision, and it matters long before you have a thousand customers.
---

When designing an AI customer-support chatbot, should we use a synchronous or asynchronous architecture?

It is easy to turn this into a question about which is more modern. It is more useful to start with something concrete:

> If customer A is waiting for an LLM to generate a response, does customer B also have to wait?

The answer depends entirely on how concurrency is handled, and the two architectures answer it differently.

## What a synchronous worker actually does

With a single synchronous worker, a request looks like this:

```
Customer A → Retrieve data → Call the LLM → Wait → Return the response
```

Until that request completes, the worker cannot touch customer B. Customer B — and everyone after them — waits in the queue. Not because the system is busy, but because the one thing that could serve them is sitting idle, blocked on a network call.

Adding workers increases capacity in the obvious way: four workers process four requests concurrently. That is a real improvement, and for a while it is enough. But the ceiling is still there. Once all four workers are waiting on OpenAI, a database, a CRM, or an order system, request five waits — even though every one of those four processes is doing nothing but holding a socket open.

That is the part worth sitting with. The bottleneck in a synchronous chatbot is usually not computation. It is workers parked on I/O.

## What asynchronous changes

An asynchronous architecture breaks the coupling between "this request is in flight" and "a worker is dedicated to it". While one request waits on an external service, the worker gets on with others:

- Customer A is waiting for the LLM
- Customer B is retrieving an order
- Customer C is receiving a streamed response

An event loop coordinates all three without assigning a worker to each waiting request. When A's response arrives, its coroutine resumes where it left off.

This matters for AI support specifically because chatbots are close to a pure I/O-bound workload. Look at where the time actually goes:

- LLM APIs
- Vector databases and knowledge bases
- CRM and order systems
- Inventory, delivery, and pricing services
- Conversation logging and analytics

Almost all of it is waiting on somebody else's network. That is the exact shape of problem async was built for.

## What asynchronous does not change

Two clarifications, because both get lost in the enthusiasm.

**Async does not make the LLM faster.** If a completion takes four seconds, it takes four seconds. Customer A's wait is unchanged. What improves is concurrency and resource utilisation — the system can serve B and C during those four seconds instead of standing still.

**An async endpoint can still block.** This is the caveat that catches people, and it is worth being precise about it. Declaring a handler `async` does not make anything inside it non-blocking:

```python
@app.post("/chat")
async def chat(req: ChatRequest):
    order = db.query(...)          # synchronous driver — stalls the event loop
    reply = openai_client.chat(...)  # blocking HTTP — stalls it again
    return reply
```

That endpoint is worse than the synchronous version. A blocking call inside a coroutine does not just delay that request; it freezes the event loop, which means it freezes every other request the loop was juggling.

The version that behaves the way you intended:

```python
@app.post("/chat")
async def chat(req: ChatRequest):
    order = await db.fetch(...)      # async driver
    reply = await client.chat(...)   # async HTTP client
    return reply
```

The same trap applies to CPU-bound work. Parsing a large PDF, computing embeddings locally, or resizing an image inside a coroutine will hold the loop for the whole duration. That work belongs in a thread pool or a separate process, not on the event loop.

The rule is simple to state and easy to violate: everything in an async path must be awaitable or offloaded. One synchronous database driver is enough to undo the entire design.

## Four components, four different problems

For a production AI support system I would generally reach for four things. They are frequently discussed as if they were alternatives, but each solves a distinct problem:

| Component | Solves | Does not solve |
|---|---|---|
| **Async API** | many concurrent connections without a worker each | model latency |
| **Response streaming** | perceived waiting time | total time to completion |
| **Multiple workers** | CPU parallelism, fault isolation | blocking inside a worker |
| **Background queues** | non-immediate work off the request path | anything the customer is waiting for |

Streaming deserves a note. It changes no throughput number at all, and it is often the single largest improvement to how the product feels. First token in 400 ms reads as responsive; four seconds of silence followed by a complete answer reads as broken, even though the second one finished at the same moment.

Background queues deserve one too. Conversation logging, analytics, file processing, CRM sync — none of it needs to happen before the customer sees a reply. Moving it off the request path is usually the cheapest latency win available, and it is independent of whether the API is sync or async.

## Synchronous is not the wrong answer

For a low-traffic MVP with simple workflows, synchronous is easier to build, easier to test, and considerably easier to debug. Stack traces are linear. There is no event loop to reason about, no question of which library is secretly blocking. If you are validating whether customers even want the thing, that clarity is worth more than throughput you do not yet need.

The calculus changes once the chatbot integrates multiple markets, knowledge bases, orders, inventory, logistics, and CRM systems. Every integration adds another external call, another few hundred milliseconds of waiting, and another opportunity for a worker to sit blocked. At that point the async architecture stops being an optimisation and starts being the thing that lets you scale without linearly buying processes.

It is also much easier to start async than to retrofit it. Migrating a mature synchronous codebase means replacing every driver and HTTP client in the request path, and finding the ones you missed in production.

## The question that matters

The useful question is not:

> Is sync or async more advanced?

It is:

> When 10, 100, or 1,000 customers arrive simultaneously, can the system serve them reliably without wasting workers while waiting for external services?

Answer that honestly for your traffic and your integration count, and the architecture decision mostly makes itself.
