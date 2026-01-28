---
title: "Team YAGNI vs Team WAGNI: pick a side!"
description: "You Ain't Gonna Need It vs We Are Gonna Need It - when to build for tomorrow and when to ship for today"
pubDate: 2025-01-27
tags: ["development", "architecture", "philosophy", "productivity"]
---

> The eternal tension between shipping fast and building for the future

## The Two Camps

**Team YAGNI** (You Ain't Gonna Need It) believes in shipping the minimum viable solution. Build what you need today, refactor when you need it tomorrow. Velocity over perfection.

**Team WAGNI** (We Are Gonna Need It) believes in anticipating future needs. Build extensible foundations, choose the right abstractions, plan for scale. Architecture over speed.

Both camps are right. Both camps are wrong. The trick is knowing when to switch sides.

## The YAGNI Advantage

YAGNI increases velocity. When you're building features, not frameworks, you ship faster. You learn what users actually want instead of what you think they want. You avoid the classic trap of building a beautiful, extensible system that solves the wrong problem.

The YAGNI approach works beautifully for:
- Feature development
- Prototyping and MVPs
- User-facing functionality
- Anything where learning beats planning

You can always refactor later. The code that ships and gets used is infinitely more valuable than the perfect code that never ships.

## The WAGNI Reality Check

But here's where YAGNI breaks down: when you're not just building features, but building the foundation for a new class of problem-solving.

Consider these scenarios:

**The Database Choice:** You're building a new service. YAGNI says "just use SQLite, we can migrate later." WAGNI says "choose PostgreSQL from day one - the migration will be painful and expensive."

**The Library Selection:** You need to parse JSON. YAGNI says "just use the built-in parser." WAGNI says "evaluate libraries now - switching later means rewriting every integration."

**The Architecture Decision:** You're building a microservice. YAGNI says "just make it work." WAGNI says "design the interfaces properly - changing them later breaks every consumer."

## The Critical Distinction

The key insight: **YAGNI works for features, WAGNI works for foundations.**

When you're building features on top of existing foundations, YAGNI is usually correct. Ship fast, learn fast, iterate fast.

When you're building new foundations - choosing databases, selecting libraries, designing APIs, creating new abstractions - WAGNI is usually correct. The cost of changing these decisions later is enormous.

## The WAGNI Sweet Spot

WAGNI isn't about over-engineering. It's about making the right foundational choices that are expensive to change later.

**Choose the right external library** - not because you need all its features today, but because switching libraries later means rewriting every integration.

**Design sustainable internal APIs** - not because you need all the flexibility today, but because changing APIs later breaks every consumer.

**Build on solid architectural foundations** - not because you need to scale today, but because rebuilding the foundation later is a multi-month project.

## The YAGNI Trap

The YAGNI trap happens when you apply "just ship it" thinking to foundational decisions. You end up with:

- Technical debt that compounds exponentially
- Refactoring projects that take longer than the original feature
- Systems that can't evolve because the foundation is too brittle
- Teams that spend more time working around limitations than building features

## The WAGNI Trap

The WAGNI trap happens when you apply "build for the future" thinking to feature development. You end up with:

- Over-engineered solutions that nobody uses
- Features that take months to build instead of weeks
- Abstractions that are harder to understand than the problem they solve
- Teams that spend more time building frameworks than solving user problems

## The Decision Framework

Ask yourself: **"What's the cost of being wrong?"**

**Low cost of being wrong = YAGNI territory:**
- UI components
- Business logic
- Feature implementations
- Most user-facing code

**High cost of being wrong = WAGNI territory:**
- Database choices
- External library selections
- API designs
- Architectural patterns
- Infrastructure decisions

## The Hybrid Approach

The best teams don't pick a side - they pick the right tool for the job.

**YAGNI for features, WAGNI for foundations.**

Build your features fast and dirty on top of solid foundations. Choose your foundations carefully, then iterate rapidly on top of them.

## The Real World

In practice, this means:

- Spend time choosing the right database, then build features quickly on top of it
- Evaluate libraries carefully, then use them liberally
- Design APIs thoughtfully, then implement them iteratively
- Choose your architecture wisely, then ship features fast

The goal isn't to be right about the future - it's to be right about what's expensive to change later.

## Pick Your Side

The next time you're making a technical decision, ask yourself: "Am I building a feature or a foundation?"

If it's a feature, default to YAGNI. Ship it, learn from it, iterate on it.

If it's a foundation, default to WAGNI. Choose carefully, build sustainably, plan for evolution.

The best developers aren't Team YAGNI or Team WAGNI - they're Team "Right Tool for the Job."

And the job is building software that users love and developers can maintain.

---

*What's your take? Are you Team YAGNI, Team WAGNI, or Team "It Depends"? Drop a comment below and let's debate.*


