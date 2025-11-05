---
title: "SCRUM is Dead, Long Live SCRUM!"
description: "Agile was optimized for human throughput. AI exposes its latency. How process friction is freezing out the agentic revolution - and what to do about it."
pubDate: 2025-11-04
tags: ["agile", "ai", "development", "process", "productivity"]
---

<style>
/* Hide floating image on mobile, show mobile image */
@media (max-width: 767px) {
  .totem-pole-float {
    display: none !important;
  }
  .totem-pole-mobile {
    display: block !important;
  }
}

/* Show floating image on desktop, hide mobile image */
@media (min-width: 768px) {
  .totem-pole-float {
    display: block !important;
  }
  .totem-pole-mobile {
    display: none !important;
  }
}
</style>

> Agile for the Agentic Age

**ICE** /īs/ *noun*

1. Water frozen into a solid state.
2. *Slang (Cyberpunk)*: Intrusion Countermeasure Electronics - defensive software designed to kill intruders who attempt unauthorized system access.
3. *Slang (Software Development)*: Procedural mechanisms that defend organizations against chaos, but also freeze out spontaneous creation and compounding automation gains.

---

## The Original Social Contract: Three Axes of Power

To understand why Agile succeeded, you need to understand what each stakeholder gained from it. There are three main axes of power in any engineering organization, and Agile provided value to all of them:

<div class="totem-pole-float" style="float: right; margin: 0 0 0 1rem; max-width: 400px;">

![The Original Social Contract: Three Axes of Power](/totemPole.jpg)

</div>

<details>
<summary><strong>Business</strong></summary>

Gets predictable timelines for delivery and regular updates. This helps them plan expenses, sign contracts, set roadmaps, and hit quarterly targets. Agile gave the business legibility - they could finally see what engineering was doing and when it would be done.

</details>

**Key gain**: Metrics and predictability.

<details>
<summary><strong>Product Management</strong></summary>

Gets a clear way to manage workload and identify when resources can be scaled up or down. Visibility into day-to-day progress helps them understand blockers, track what's taking longer than expected, and identify impediments before they derail delivery. When Business priorities shift, Product can quickly adjust team velocity and capacity without major restructuring.

</details>

**Key gain**: Visibility and control.

<details>
<summary><strong>Developers</strong></summary>

Gets small, manageable units of work. When done correctly, this drives higher quality and velocity. Product Management breaking down business requirements into epics into stories into tasks makes complexity tractable.

</details>

**Key gain**: Well-scoped and clearly defined work.

<div class="totem-pole-mobile" style="display: none; text-align: center; margin: 2rem 0;">
<img src="/totemPole.jpg" alt="The Original Social Contract: Three Axes of Power" style="max-width: 100%; max-height: 400px; height: auto; margin: 0 auto;">
</div>

The genius of Agile was that it created a system where everyone got something valuable. But as Agile matured and spread across the industry, something changed.

<details>
<summary><strong>What changed?</strong></summary>

The tragedy of Agile is what happened next: **it redistributed control upward**.

The balance of power shifted from passionate engineers solving problems to bean counters measuring velocity. Agile fell into a predictable rut: marathon ceremonies where product managers read ticket descriptions that could have been shared asynchronously, while developers sit through hours of planning for just a few minutes of actual estimation. Story point poker where there's no accountability for implementation time diverging from the estimate. Retrospectives where the same action items appear sprint after sprint, dutifully recorded and promptly forgotten. Sprint planning became sprint approval. Story points became developer surveillance. The ticketing system became an audit trail first and a workflow tool second!

</details>

The dynamic, responsive methodology that promised to free developers from waterfall's rigidity became its own kind of straitjacket- but with better metrics!

<div style="clear: both;"></div>

And in a pre-AI era, this was all tolerable. The endless meetings were annoying, but the work still had to be done by a human, and humans are slow. The overhead of process felt proportional to the cost of human labor.

**AI redistributes capability downward, and has no regard for the rules of Agile.** What each level of the totem pole should expect from the sprint process needs to evolve accordingly.

## SCRUM is dead.

Agile assumes a closed system with predictable throughput. Real engineering is an open system with stochastic workloads: production incidents, unexpected bugs, emergent technical debt, and now - most importantly - work that AI can complete in minutes rather than days.

Consider the "drag" that plagues most modern Agile teams:

- **Unexpected production issues** need fixing NOW, but weren't in the sprint
- **Developer environment issues** grind productivity to a halt
- **Business priorities** shift mid-sprint (orders from on high!)
- **Emergent technical debt** gets discovered during feature work

Most teams handle this in one of a few ways:

1. **Always take X-Y points** in a sprint (where Y is a pessimistic buffer for unexpected work)
2. **Pad the sprint** with low-priority busywork that can be dropped when urgent issues arise
3. **Bury their head in the sand** and pretend that any time a sprint isn't completed, there was nothing that could have been done to avoid it

These approaches assume humans are the constraint, where the bottleneck is implementation time, not decision latency.

When an AI can go from "investigate this bug" to "pull request ready for review" in less time than it takes to jack in and locate the construct, the constraint isn't development time anymore. **The constraint is permission.**

The sprint process becomes Agile-ICE - not the protective kind that defends against chaos, but the deadly kind designed to kill unauthorized access. Like the ICE in Neuromancer, it doesn't distinguish between a malicious intruder and a legitimate user moving too fast. It just blocks. The lever to deactivate this ICE lies solely with the Scrum Master - usually product management.

**SCRUM isn't bad - it's just obsolete.**

The framework that revolutionized software development in the 2000s and 2010s is now the thing holding back the next revolution. It's not that the principles are wrong - transparency, inspection, and adaptation remain crucial. It's that the specific mechanics are optimized for the wrong constraint.

In an agentic world, the bottleneck isn't implementation speed. It's decision latency. It's permission gates. It's process friction that freezes out the exponential gains AI promises.

The question isn't whether SCRUM will survive - it's whether your organization will survive the transition to an agentic world.

## The Solution: Agentic Tickets

So how do we thaw the ice without melting into chaos?

Create a **separate track for AI-driven work** where the AI (with human approval) can create tickets and immediately attempt to solve them.

I'm calling these **Agentic Tickets** (or `AI_CHORE` in JIRA parlance, if you want to be literal).

### Proposal: Formalize the Agentic Ticket Pattern

<details>
<summary><strong>Eligibility Criteria:</strong></summary>

- **≤1 story point** (strictly timeboxed)
- **Clearly scoped** (well-defined problem and success criteria)
- **Low blast radius** (reversible, doesn't touch critical paths)
- **Sufficient detail and ease of review** for an AI agent to implement autonomously

</details>

<details>
<summary><strong>Lifecycle:</strong></summary>

1. Ticket is created (by AI or human+AI)
2. AI immediately begins work (no sprint planning gate)
3. AI posts pull request with tests and description
4. Human reviews (this is critical - never skip this!)
5. **Success**: PR is approved and merged, human marks ticket as done 

   **Failure**: PR fails review, ticket converts to standard issue type and follows normal sprint process

</details>

**Key Rules:**
- **Not subject to sprint injection rules** (removes friction for small, valuable work)
- **Maximum 1 point** (prevents abuse)
- **Strict timeboxing** (if it's not done in hours, escalate it)
- **Metrics shift from story points to time-to-resolution** (measure responsiveness, not forecasting)

Here are three scenarios that illustrate how Agile-ICE blocks value delivery in the agentic era.

## Scenario 1: Reactive Debugging - The Ops-to-Fix Pipeline

**You, the engineer on call, are instructed to debug a Datadog error in your production application.**

<details>
<summary><strong>THE OLD WAY (Human-Only)</strong></summary>

You investigate the issue. Open Datadog, trace through logs, check recent commits, maybe reproduce it locally. If the fix is obvious, you slap together a JIRA ticket and throw it in the backlog. It'll get done someday, hopefully with enough detail that there's no drag when someone picks it up weeks later.

If the fix isn't obvious, you spend significantly longer trying to gain clarity before creating the ticket.

Either way, the fix happens in 2+ weeks, not 2 hours.

**Process friction** - but at least the investigation took long enough that the process delay felt proportional.

</details>

<details>
<summary><strong>TODAY, WITH AGENTS (The Problem)</strong></summary>

You click the "open in Cursor" button in Datadog and ask your agent to help investigate. The agent analyzes the stack trace, reviews recent commits, checks logs, and provides context:

"This is a null pointer exception caused by a race condition in the payment processing queue. The issue was introduced in commit abc123f when we refactored the retry logic. Here's a proposed fix with tests."

You review it. Looks good. You ask the agent to create a JIRA ticket with all the relevant details.

**AND HERE AGILE-ICE STOPS YOU COLD.**

The ticket is created. It's in the backlog. Product will prioritize it in the next sprint planning session - two weeks from now. Maybe it gets picked up by you, maybe by someone else who'll need to rebuild context. The pull request that would take the AI a few minutes to generate will take 2-3 weeks to merge.

The investigation now takes minutes, but the fix still takes weeks. The process latency that was once proportional to human effort is now the dominant cost.

</details>

<details>
<summary><strong>THE NEW MODEL (Agentic Tickets)</strong></summary>

You click the "open in Cursor" button in Datadog and ask your agent to help investigate. The agent analyzes the stack trace, reviews recent commits, checks logs, and provides context:

"This is a null pointer exception caused by a race condition in the payment processing queue. The issue was introduced in commit abc123f when we refactored the retry logic. Here's a proposed fix with tests."

You review it. Looks good. You ask the agent to create an Agentic Ticket and immediately start working on it. The agent creates the ticket, generates the fix, and posts a pull request. Your coworker reviews it, tests pass, and you merge it.

You've solved the issue end-to-end before the Agile-ICE could even activate. The investigation, fix, review, and merge happen faster than the old process could even categorize and prioritize the work.

</details>

**The insight**: Process latency is now more expensive than implementation time.

## Scenario 2: Feature Cleanup - Ticket Overlap Collision

**You, the engineer, are informed that there are issues with a recently developed feature. Product has created three tickets detailing problems that require attention.**

<details>
<summary><strong>THE OLD WAY (Human-Only)</strong></summary>

You read the three tickets and start working. As you dig in, you realize there's overlap - two tickets are addressing symptoms of the same root cause. You also discover two additional edge cases that weren't in the original tickets.

This triggers the familiar cascade of questions:

- Should the tickets be combined? Do I need to make a case to product, or can I just combine them myself?
- If they stay separate, will I encounter merge conflicts later?
- For the new issues I discovered: do I fold them into existing changes (BAD - teammates will hate you) or create new tickets (YES - small changes are happy changes)?

You create two new tickets for the edge cases and throw them in the backlog. Those new tickets get scheduled for the next sprint. You'll grind away at them 2+ weeks from now when your context has evaporated. Since humans are slow, the 2-week delay doesn't feel like the main bottleneck.

**Process friction** - but since implementation takes days anyway, the delay is tolerable.

</details>

<details>
<summary><strong>TODAY, WITH AGENTS (The Problem)</strong></summary>

The same scenario plays out, but now AI could cut through this ambiguity [like Alexander cutting the Gordian Knot](https://en.wikipedia.org/wiki/Gordian_Knot) - instantly analyzing the overlap, generating fixes for all related issues, and posting clean PRs in 20 minutes.

But you still have to follow the sprint process. You create the tickets, they go into the backlog, and you wait for product approval. The AI that could have solved everything while context is hot now sits idle for two weeks.

**Agile-ICE removes most of the value** - the tiny fixes that could be done immediately get frozen by process designed for week-long human implementation cycles.

</details>

<details>
<summary><strong>THE NEW MODEL (Agentic Tickets)</strong></summary>

You discover the edge cases, create Agentic Ticket entries for them, and let the AI handle them immediately. Twenty minutes later, you have PRs ready for review. You merge them while the context is still hot, before anyone forgets why these edge cases matter.

</details>

**The insight**: When AI can resolve ticket ambiguity and implementation in minutes, waiting weeks for sprint planning approval becomes the dominant cost.

## Scenario 3: Proactive Refactoring - Self-Healing Code

**You, the engineer, notice a recurring pattern of code smells while working on a feature.**

<details>
<summary><strong>THE OLD WAY (Human-Only)</strong></summary>

You might not even notice the deprecated APIs, or if you do, you file it away mentally. "That's tech debt, we'll deal with it later." Maybe you mention it in a standup. Maybe someone creates an epic titled "Dependency Modernization" that sits in the backlog for six months.

Eventually it becomes a nasty surprise during an upgrade, or it takes a full sprint to plan and execute when product finally prioritizes it.

**Process friction** - but since you couldn't have fixed it quickly anyway, it doesn't feel like a huge loss.

</details>

<details>
<summary><strong>TODAY, WITH AGENTS (The Problem)</strong></summary>

Your agent says: "I've detected three deprecated API calls in this module and four unused dependencies in package.json. I can create PRs to modernize these and remove dead code. This will reduce bundle size by ~40KB and eliminate two console warnings."

You say: "Do it."

The agent opens four pull requests with tests and detailed descriptions. You review them. They're solid. You'd love to merge them because you know they'll prevent issues down the line.

**But there are no tickets for these changes.**

You need tickets because all code changes must be associated with work items (audit compliance, capitalization of engineering costs, etc.). You create tickets for each PR.

Now product needs to approve them. "Tech debt" isn't scoped for this sprint. These get prioritized for "Q4 Stability Improvements" - i.e., maybe never.

**Agile-ICE blocks self-healing.** The work is done. The value is ready to be captured. But the process forbids merging it.

</details>

<details>
<summary><strong>THE NEW MODEL (Agentic Tickets)</strong></summary>

The agent detects the issues, creates Agentic Ticket entries, generates the fixes, and posts PRs. You review and merge them. The codebase improves continuously rather than accumulating tech debt that requires dedicated sprint time.

</details>

**The insight**: When AI enables continuous code improvement, forcing preventative maintenance into quarterly "tech debt sprints" wastes the system's self-healing potential.

## The Trust Requirement

This requires a different type of trust than traditional Agile, but it's built on the same foundation.

Current Agile already depends on trust:
- Developers estimate tickets in good faith, not padding estimates to look busy
- Developers don't include out-of-scope changes in their implementations
- Developers follow what's been delegated to them in JIRA rather than freelancing
- Product trusts developers to surface blockers and technical concerns honestly

The Agentic Ticket pattern is an **extension** of this existing trust contract, not a replacement. The difference is speed and scope.

Potential concerns about the "fast track":
- Devs could try to push through unnecessary changes or introduce low-quality code through reduced scrutiny on the AI track
- The question "Should this be an AI_CHORE or not?" could become a new source of friction
- Product could feel they're losing control of velocity metrics or the overall direction of the product

These are legitimate concerns. But they're the same concerns that exist in regular Agile, just compressed in time. The safeguards remain: code review, testing, the 1-point limit, and the escalation path when something doesn't fit the fast track.

Adhering to a process that doesn't serve all levels of the totem pole is ultimately doomed. If developers feel that the process prevents them from delivering value, they'll find ways around it - shadow work, off-sprint contributions, or worse, disengagement.

The Agentic Ticket pattern codifies what should happen: **let the AI try. If it succeeds, great. If it fails, escalate gracefully.**

## The Totem Pole Perceptions

The whole forest is burning, but everyone's focused on the trees in their backyard.

<details>
<summary><strong>Business</strong></summary>

Sees a well-oiled machine. Sprints are loaded with tickets, story points are being hit, KPIs are green. They may believe they're leveraging AI effectively because developers have AI coding assistants. What they don't see is how much potential value is trapped behind process gates - the small fixes and improvements that could compound into significant gains if they weren't bottlenecked by sprint planning.

</details>

<details>
<summary><strong>Product Management</strong></summary>

Sees a system that works. They need buffer tickets to manage inevitable scope changes, shifting priorities, and unexpected work. The existing system gives them tools to adjust velocity and swap priorities without breaking commitments to stakeholders. These aren't malicious practices - they're survival mechanisms in an uncertain environment. But they don't see how these same mechanisms create friction with the fast-turnaround potential of AI-driven work.

</details>

<details>
<summary><strong>Developers</strong></summary>

Feel the friction but don't understand why they're still not getting more work done. They know AI could deliver value now, not in two weeks, and they're frustrated by the process gates. But they often can't articulate why the existing system is broken - they just know it feels slow. Their perspective gets dismissed as "just wanting to code faster" rather than recognizing a fundamental shift in what's possible, and they lack the authority to change the process anyway.

</details>

The result? Each level has a partial view of the system, but none see how AI has changed the underlying economics of software delivery.

## How Agentic Tickets Restore Alignment Across the Totem Pole

For this to work, all three stakeholders need to win:

<details>
<summary><strong>Business</strong></summary>

- Gets faster ROI on small-value items
- Reduced operational costs (compare the human efforts involved: investigate + fix in 2 hours vs. investigate + ticket + sprint + implement + review over 2 weeks)
- Better system stability through faster response to issues

</details>

<details>
<summary><strong>Product Management</strong></summary>

- Reduced noise in backlog (small issues don't clog up sprint planning)
- More time to focus on core competencies: planning large features, coordinating stakeholders, unblocking critical issues
- Clear audit trail remains intact (tickets still exist, PRs still reviewed)

</details>

<details>
<summary><strong>Developers</strong></summary>

- Freedom to delegate trivialities to AI while maintaining quality through review
- Reduced context-switching costs (fix issues while context is hot)
- Restored sense of agency and responsiveness
- Elevation of focus to higher-level architectural and strategic problems

</details>

The goal is to preserve code quality and organizational oversight while acknowledging a fundamental shift: **when the cost of implementation drops to near-zero for certain types of work** - small bugfixes, refactors, tech debt cleanup - **the cost of process becomes prohibitive**.

## The Industry is Still Adapting

We're in the early stages of figuring out how to extract maximum value from AI agents. But that they are powerful tools providing real value is indisputable. If you don't believe this, I implore you to try using modern agentic workflows. We're a long way from ChatGPT 3.5, and a lot of AI-negative sentiment seems to be stuck evaluating outdated models as the basis for their opinion. (As a fun aside: any research paper on this subject is obsolete by the time it's published. The pace of capability improvement makes academic publishing cycles look glacial.)

What's less clear is how our organizational processes need to evolve to accommodate them.

The story points system, sprint ceremonies, backlog grooming - all of these were designed for a different era. They're not unneeded, but they are lagging indicators when the bottleneck has shifted from implementation to permission.

**The AI can't adapt to your process.** It can't change your sprint process. It can't override product priorities. It can't merge its own PRs (and shouldn't!). AI operates at machine speed with human judgment - if we let it.

But *we* can change the process. We can create new patterns that preserve the accountability and auditability of Agile while unlocking the responsiveness that AI enables.

## Long Live SCRUM!

The principles that made Agile powerful remain true:
- Small batches of work
- Fast feedback loops
- Continuous improvement
- Sustainable pace

As code becomes increasingly self-improving, process must become self-melting. ICE kept us safe in the human era; now it keeps us slow. The mechanisms need to evolve. Sprint gates made sense when humans were the bottleneck. Now process is the bottleneck.

SCRUM is dead. The SCRUM of 2015, optimized for forecasting human throughput in a pre-AI world.

Long live SCRUM! The SCRUM of 2025 and beyond, optimized for organizational responsiveness in an agentic age.

---
*Have thoughts on Agentic Tickets or war stories about development in the AI era? I'd love to hear them. Please drop a comment below.*