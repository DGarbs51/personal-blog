---
title: "The Best Laravel Apps I've Seen Are Boring as Hell"
description: "Teams constantly reach for complexity when simplicity would've been better. The best production apps use the framework's tools, design their schema, batch their jobs, and put their files in S3."
pubDate: "Mar 19 2026"
heroImage: "../../assets/boring-laravel-apps.webp"
---

A few months ago I was on a call with a team that had done something creative. They'd built a custom Docker image with MySQL baked into it alongside their application — the whole thing running as a queued job. The idea was that running MySQL locally against their data feeds would give them better performance than batching or using the tools Laravel already ships with.

When we actually reviewed their architecture, they didn't need any of it. The custom image, the embedded database, the extra infrastructure — none of it was solving a real problem. They'd built something genuinely clever to handle a situation that didn't exist.

I'm a Solutions Engineer at Laravel. I spend a lot of my time looking at how teams build things — what they're using, how they've structured it, where they're stuck. I don't have an exact count, but I've seen enough production apps to notice the patterns.

And the pattern that keeps showing up is this: teams reach for complexity when simplicity would've been better. Not occasionally. Constantly.

The best apps I see — the ones that hold up under load, that the team can maintain without losing their minds, that don't require a PhD in the codebase to debug at 2 AM — are boring. Aggressively, deliberately boring.

## The queue job that tries to do everything

This is maybe the most common one. A team has a background process — importing data, generating reports, syncing with an external API — and they build one massive queue job to handle it. The job runs for minutes. Sometimes hours. It eats memory. If it fails partway through, the whole thing retries from the beginning.

Here's a real example. On Laravel Cloud, there's a window between when a SIGTERM gets sent during deployment and when the SIGKILL follows — currently maxed out at 600 seconds. A team had jobs that ran for hours. Every time they deployed, those jobs got killed and had to restart from scratch.

Deployments became something the team dreaded because it meant blowing up hours of processing work.

When we dug in, they could break the job into smaller pieces that each fit under that 600-second window. After the change, deployments didn't nuke their processing anymore. The batch just kept pushing through — finish the current small job, pick up the next one after deploy, keep going.

The fix is almost always the same: break it up. Instead of one job that processes 10,000 records, dispatch a batch of small jobs that each handle a piece. Laravel's `Bus::batch()` exists for exactly this reason. Each job is fast, uses almost no memory, and if one fails, you retry that one. Not all of them.

I get why teams don't do this initially. One job feels cleaner. You can see the whole flow in one file. But "simpler to write" and "simpler to run" are different things, and the gap shows up at the worst possible time.

## Loading everything into memory because pagination feels like overhead

A team needs to process a dataset — could be a report, an export, a nightly sync — and they pull the whole thing into memory. `User::all()`. Just load it. It works in dev where you've got 500 rows. It dies in production where you've got 500,000.

`chunk()` and `lazy()` and `cursor()` exist. They've existed for a long time. And yet.

Teams treat chunking as something you add later — an optimization for when things get slow. But the cost of building it in from the start is almost nothing. A `chunk(1000)` call is barely more code than `all()`. The difference is that one of them will still work when your dataset grows 100x and the other one will OOM at 3 AM on a Saturday.

## MongoDB as the everything store

This one gets me.

I keep seeing teams reach for MongoDB — or any document database — because they think they can solve two problems at once: skip schema design and replace Redis as a cache layer. One machine, two birds.

That's not even remotely a good way to use MongoDB.

What actually happens: they end up with a poorly architected schema shoved into documents instead of designed properly, plus a cache layer that's slower than Redis and harder to reason about. They didn't save complexity. They moved it somewhere worse.

Postgres has robust JSONB support now. If you genuinely need to store semi-structured data alongside your relational models, you can do it in the same database with the same query language. You get document flexibility where you need it without abandoning relational modeling everywhere else.

If you need a cache, use Redis. It's purpose-built for it. If you need a relational database, use MySQL or Postgres and invest the time in designing your schema. If you have a real use case for document storage — genuinely unstructured data that doesn't fit a relational model — sure, MongoDB has a role. But "I don't want to think about my schema" isn't that use case.

## It's 2026 and you're still not using S3-compatible storage

I almost feel bad listing this one because it's so straightforward. But I keep seeing it.

Laravel has had filesystem abstraction since — what, Laravel 5? The `Storage` facade. S3 driver built in. Flysystem under the hood. Switching between local storage and S3-compatible storage is a config change.

And yet teams are still storing uploads on the local disk. User avatars in `storage/app/public`. Generated reports in a folder that lives on one server instance. It works until they need to scale horizontally, or until the disk fills up, or until they lose the server and realize their backup strategy didn't include that folder.

S3-compatible storage — whether it's actual AWS S3, DigitalOcean Spaces, MinIO, whatever — costs almost nothing, scales without you thinking about it, and Laravel already speaks the language. There's no architectural decision here. It's just the right default in 2026.

## So why do smart teams keep doing this?

The teams making these choices aren't bad engineers. They're often really good. They know these tools exist. They've read the docs. Some of them have probably given conference talks about queue best practices.

The pull toward complexity comes from a few places.

One — complexity feels like engineering. A simple `Bus::batch()` call doesn't feel like you built something. A custom queue orchestration layer with retry logic and dead letter handling? That feels like craftsmanship. There's a real psychological reward in building something intricate, even when the problem didn't call for it.

Two — people optimize for the problem they imagine, not the one they have. The MongoDB choice often starts with "what if our data model needs to change rapidly?" A problem they might have someday. Not one they have today. Meanwhile, the problem they actually have — consistent data with enforceable relationships — goes unsolved.

Three — and this one's uncomfortable — résumé-driven development is real. "Built a custom event sourcing system" looks better on a CV than "used the queue batching feature that ships with the framework." Nobody's doing this maliciously. But the incentive exists and it shapes decisions.

## I'm not immune to this

I built a SaaS called Neon Bot — an AI-powered Discord management bot. Fully architected for high availability on Kubernetes. Capable of handling millions of requests per second through the Discord gateway. Ready to support a massive number of guilds.

It has one user. Me. And I don't even use Discord anymore.

I built the infrastructure for a scale that will probably never exist — because the infrastructure was the fun part. Getting actual users? That's the hard part. That's always the hard part.

So when I say teams reach for complexity because it feels like the real work, I'm not throwing stones. I do the same thing. The difference isn't discipline. It's catching yourself before the clever solution ships to production, where someone else has to maintain it.

The best Laravel apps I've seen didn't do anything interesting with their architecture. They used the framework's tools, designed their schema, batched their jobs, and put their files in S3.

Boring. And it worked.
