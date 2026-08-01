---
title: An AI agent does not need to remember everything
date: 2026-08-01
tags: [AI Agents, Enterprise AI, System Architecture, AI Engineering]
excerpt: Producing a convincing answer is no longer the hard part. The hard part is the agent still working tomorrow — and that turns out to be a state problem, not a memory problem.
---

Getting an AI agent to produce a convincing answer is no longer the hardest problem. Models are good enough that a carefully written prompt and two or three tools will get you something that demos well.

The real test begins the day after. The agent has to keep operating across longer conversations, failed tools, changing business rules, human handovers, and workflows that were interrupted halfway through. That is a different engineering problem, and most of its difficulty has nothing to do with the model.

From building enterprise workflows and AI customer-support systems, I have become increasingly convinced of one thing:

> An AI agent does not need to remember everything. It needs to preserve what matters.

The instinct when a conversation gets complicated is to carry more of it forward — append the last tool output, re-inject the policy document, keep the full transcript in the window. It feels like diligence. In practice it is the fastest way to build a system that is expensive to run, impossible to inspect, and unpredictable in exactly the situations where you need it to be predictable.

## Four things that are not the same

Most of the confusion in agent design comes from treating these as one thing:

| | What it holds | Shape | Read by |
|---|---|---|---|
| **Conversation history** | the literal turns, verbatim | append-only, unbounded | the model, when relevant |
| **Memory** | durable facts that outlive this conversation | small, curated, mutable | the model, selectively |
| **Workflow state** | where this task is right now | bounded, mutable, structured | the orchestrator |
| **Audit log** | what happened and why | append-only, immutable | humans, compliance |

Conversation history is not memory. A transcript is raw material; memory is what you decided was worth keeping. By turn forty, most of a transcript is noise — clarifications, retries, the model apologising for a tool that timed out.

Memory is not workflow state. That a customer prefers email over phone is memory. That their refund is at step three of five, blocked on a manager approval, is workflow state. The first is a fact about a person. The second is a position in a process, and it is the thing you resume from.

Workflow state is not an audit log. State tells you where you are; the log tells you how you got there. State is overwritten as the task advances. The log never is — which is precisely why it can answer the question a regulator or an angry customer actually asks.

Collapse these into one large context window and you lose the properties that made each of them useful.

## What operational state actually holds

Instead of repeatedly carrying the whole conversation forward, I prefer to maintain a structured operational state that answers a fixed set of questions:

- What is the user trying to achieve?
- What has already been completed?
- What evidence has been collected?
- Which decisions and policy rules were applied?
- What failed, and what has already been retried?
- What is still unresolved?
- Does the next step require human approval?
- What should happen next?

Written down, that is a small object — a few hundred tokens, not a few hundred thousand:

```ts
interface TaskState {
  goal: string
  completed: Step[]
  pending: Step[]
  evidence: EvidenceRef[]        // pointers, not payloads
  decisions: { rule: string; outcome: string; at: string }[]
  failures: { step: string; error: string; attempts: number }[]
  blockedOn: 'human_approval' | 'external_system' | null
  nextAction: Action | null
}
```

The detail worth emphasising is `evidence`. The original messages, documents, and tool outputs do not go into the state object — references to them do. The raw material stays in storage as evidence and is retrieved only when a step actually needs it. A refund decision does not need the full order history in context; it needs the order total, the purchase date, and the policy clause that applied.

This is what makes the difference between an agent that degrades over a long conversation and one that does not. State that answers eight questions stays roughly the same size at turn five and turn five hundred. A transcript does not.

## Why one big context window fails

Three ways, and they compound:

**It gets expensive.** Cost scales with what you carry, and carrying everything means paying for the whole history on every single turn — including the ninety per cent of it that has no bearing on the next decision.

**It gets hard to inspect.** When something goes wrong, "read the transcript" is not a debugging strategy. With explicit state you can look at one object and see the goal, the completed steps, and the failure. With a context window you are reconstructing intent from a wall of text.

**It gets unpredictable.** Long contexts dilute attention. A policy rule stated at turn three competes with forty turns of chatter by the time it matters. The model does not forget it exactly — it just weighs it against everything else you insisted on carrying forward.

## What a production system needs beyond prompts

A demo needs a prompt and a model call. A production system needs the machinery around them:

- **Checkpoints** — a durable write after each meaningful step, so a crash costs one step rather than the whole task.
- **Resumable state** — the ability to reload a task hours later, after a restart or a handover, and continue rather than restart.
- **Validation** — schema checks on every tool call and every state transition, so a malformed model output fails loudly at the boundary instead of quietly corrupting the run.
- **Observability** — traces you can filter by task, step, and outcome. Not log lines; structured events tied to the state they changed.
- **Policy controls** — business rules enforced in code, evaluated outside the model, recorded in the decisions list.
- **A path for human intervention** — an explicit blocked state, a queue a person can see, and a way to resume the workflow after they act.

None of these are AI features. They are the ordinary requirements of reliable business software, and skipping them is what makes an agent feel fragile even when the model is performing well.

## Who is allowed to do what

The principle I keep coming back to is a division of authority:

> The AI can understand the language and recommend an action. The system must control the money, inventory, permissions, policies, and final execution.

Consider a refund request. The agent is genuinely good at the hard part: reading a frustrated, ambiguous message and working out that this is a refund request for a specific order, and that the customer is citing a delivery delay. That is language understanding, and it is what the model should be doing.

What the agent should not do is decide the refund. Whether the order is inside the refund window, whether the delay was the carrier's fault, whether this customer has already had two goodwill credits this quarter, what the approval threshold is above a certain amount — those are policy evaluations against real records, and they belong in code that runs the same way every time and leaves a trace.

So the agent proposes: *refund order #1042, £84, reason: delivery delay*. The system evaluates the policy, finds the amount is above the auto-approve threshold, sets `blockedOn: 'human_approval'`, and queues it. A supervisor approves. The system executes the refund, appends the decision to the audit log, and hands control back to the agent to tell the customer.

The model never touched the money. It did the part it is good at, and the boundary is drawn where correctness stops being a matter of interpretation.

## The actual shift

A good demo produces an impressive answer.

A production system must also explain what happened, continue from where it stopped, and recover safely when something goes wrong. Those three requirements — explicability, resumability, recoverability — are not features you add at the end. They are consequences of how you decided to hold state on the first day.

That is the real shift: from treating an AI agent as a chatbot to engineering it as reliable business software.
