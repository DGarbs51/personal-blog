---
title: "I left an engineering management role at a Fortune 100 for a job I'd never done. It wasn't a step backward."
description: "From solo builder to managing 16 people across two countries, to walking away for a role at Laravel. A story about what the career ladder gets wrong."
pubDate: "Mar 17 2026"
---

The app started as a solo project. One developer, one problem to solve — an Excel form on a LAN drive that locked everyone else out when somebody went to lunch with it open. That was it. That was the whole brief. Build something better than that.

Four years later I was managing 16 people across two countries, responsible for a portfolio of mission-critical apps, and wondering when exactly I'd stopped building things.

## The Builder

The first version was just a web form. A better way to collect data that didn't hold the entire team hostage every time someone forgot to close the spreadsheet before lunch. It worked. People used it. Then a processing team needed a guided intake form to cut down on not-in-good-order requests over the phone. So I built that too.

Then it kept going.

One app became 34. A full hub-and-spoke platform with RBAC — users only saw what they were supposed to see, which matters when you're in regulated financial services. Then came the OCR/ICR pipeline: automatically indexing paperwork so humans didn't have to, then quick-validation processing instead of full manual review. Two systems that grew toward each other until they connected.

Then came the microservices. Forty-plus. Here's one: the company was paying an external vendor to handle mail merges for annual customer account reviews. We built an event-driven process — dynamic HTML to PDF, posted straight to the company website. Killed the vendor contract. That was one of forty.

All of this fell under business automation and tech solutions — business intelligence, if you want the label people actually recognize. The hub-and-spoke platform ran on Laravel. The microservices were Python on AWS Lambda. The OCR pipeline was mostly AWS — DynamoDB, SQS, Lambda — with a Laravel front end. Different tools for different jobs. But Laravel was the thing that started it all, and the thing I kept reaching for when I needed to build something fast that actually worked.

I loved this work. The kind where you lose three hours and look up and it's dark outside and you forgot to eat. If you've been in that zone, you know.

Here's what nobody tells you about building something successful inside a big company: the reward for building well is never "keep building." The org wraps around your work like a vine. More users means more requirements means more developers means someone needs to manage all of it.

That someone was me.

## The Trap

By 2023 I had three sub-teams. Engineers across the US and India. A manager title I'd raised my hand for — because everything I'd learned up to that point said that's what you do next. My VP told me it wasn't necessary. I didn't need the title to keep doing the work. But I'd been groomed for it. Every signal in my career pointed here. So I took it, even though part of me suspected my VP might have been right.

The calendar filled up fast. Tetris, but every piece is a meeting and none of them fit.

I sat through the same meeting five times on the same topic. I got on 1-on-1s and heard someone complain about a teammate not shipping what they needed — meanwhile they weren't shipping what *I* needed. And then the one that really got me: my team lead told me he'd been gatekeeping problems so I wouldn't get bogged down. He thought he was helping. He thought I was so buried that his job was to shield me from more work.

No, man. Bring me the roadblocks. That's the whole point.

But he wasn't wrong that I was buried. That was the thing.

I didn't know how to multiply myself through other people. Couldn't figure out how to create more than 100% of me through a team of 16. The management wasn't the enemy — I was. I didn't have the skill. Nobody trained me for it. The title came with a calendar full of meetings but no manual for the part that actually mattered.

Everyone said I was doing a great job. My manager. My peers. Positive feedback across the board. And that made it worse — because the gap between "you're doing great" and how I actually felt was a canyon I couldn't see the bottom of.

2024 and into 2025 broke me. I don't say that lightly.

I got distant from friends and family. Angry all the time — mean, even, in ways I'm not proud of. I cycled through overeating, vaping, not eating, not sleeping. Each cycle worse than the last. By 2025 it got to the point where I had an anxiety attack so bad I started to understand why people decide to quit everything. Not just the job. Everything.

I didn't. But I understood the feeling for the first time. And that scared me more than anything on any roadmap ever has.

Here's the detail that still gets me: at one point I stepped away from managing for about six weeks. In those six weeks I shipped more by myself than my entire team had in a year.

That's not a knock on them. They were capable people. It's a knock on me — on my inability to turn what I could do alone into something a team could do together. That gap was eating me alive.

## The Post I Wrote

In July 2025, I wrote a [blog post](https://dgarbs51.com/blog/fork-in-the-road/) about choosing to stay. I called it "The Fork in the Road." Loyalty. Finishing what I started. Choosing the harder path because it was the right one.

I meant every word of it.

I was also in denial.

Both of those things were true at the same time. Nobody tells you that about big decisions. You don't go from "I'm staying" to "I'm leaving" in a straight line. You hold both at once until one of them breaks.

The thing that broke wasn't my commitment. It was me.

## The Exit

A meetup changed everything. PHPxNYC, organized by Joe Tananbaum — one of the original Laravel employees. Dave Hicking was there too, another Laravel employee. Dave had been my team lead's college roommate. I'd met him at LaraconUS 2024 when he was still at Userscape.

I asked them what it was like working at Laravel. How they got hired. Whether there were any openings.

Dave told me he'd recorded a video — just pitched himself cold, described a gap he saw from the outside, and sent it in. No open position. Just conviction. That stuck with me.

When I got home I saw Laravel had posted a Solutions Architect role. Every requirement mapped to something I'd already done. So I applied. Took a page from Dave and recorded a video with my pitch.

I wouldn't have done this for anyone else. I wasn't on job boards. I wasn't daydreaming about startup culture. But Laravel is the framework at the center of everything I built. The platform that started it all, every side project, every piece of work that made me fall in love with this craft. If one company in the world could make me walk away from a senior role at a Fortune 100, this was it.

The process moved fast. I ended up in a final interview with Tom Crary, Laravel's president and COO.

And I withdrew my application.

My wife was seven months pregnant. With our first kid, she'd been readmitted for 10 days. They called it postpartum preeclampsia. It took them the full 10 days to actually listen to her and find a massive ulcer in her duodenum from the NSAIDs they'd overprescribed. I'd already been through one pregnancy where the medical system failed us. The thought of switching jobs mid-pregnancy — leaving Fortune 100 benefits for a Series A startup — I couldn't do it.

I also assumed two weeks mattered. At a Fortune 100, if you don't fill a req fast, you lose it. I figured Laravel worked the same way.

They didn't. They came back and said they'd wait.

That was the moment I realized I was dealing with a different kind of company. Not one that needed to fill a seat. One that wanted the right person, even if it meant months.

Some of my closest friends knew what Laravel meant to me. They got it. One of them — who was also my employee — told me how much he'd wanted to work with me, that it was part of why he took the job in the first place. But he understood.

I took the role.

Sixteen reports to zero. Fortune 100 to Series A. Engineering management to solutions engineering — a title I'd never held, in a function I didn't fully understand.

## What I'm still figuring out

I'll be honest: I didn't realize this was a sales role.

I knew the title said "solutions engineer." I knew it was customer-facing. But I talk to customers every day now. I'm the technical seller on the team — a team of one — supporting all of our account executives. I sell Private Cloud, a product that was somewhere between zero and one when I started. Maybe 0.75.

I went from "team of one building an app" to "team of 16 managing apps" back to "team of one selling a product."

And here's what surprised me: I love it.

I get on streams and talk about Laravel Cloud. I help customers with complex requirements figure out how to migrate onto our platform. I'm selling something I believe in, built by people I respect, to developers solving real problems. The product changes fast. I learn something every day. And nobody's asking me to sit through the same meeting five times about the same damn topic.

I'm not wrapping this up with a bow. I'm still in the middle of it. I have ADHD, which means every day is some version of a mental health fight — not the deep, dark kind from 2025, but something. Always something.

What I know is this: the career ladder assumes "up" means more people, more scope, bigger title. For some people that's right. For me, the actual forward move looked like a step backward on every visible metric. Smaller company. No reports. A title nobody in my old world would recognize.

Eight months ago I wrote a post about choosing to stay. I meant it. And then the thing I was staying for kept breaking me until I couldn't hold the line anymore.

The system that promotes builders out of building — that takes your best work and rewards you by making sure you never do it again — that system doesn't have a category for what I did. It calls it "leaving." It calls it "stepping down." It doesn't have a word for "I found the one thing worth blowing this up for."

I don't know if I'll be at Laravel forever. I don't know if I'll manage people again. I don't know if this role is the final shape of my career or just the next phase.

But I know staying would have cost me more than leaving did.

If you're in a role that looks right on paper and feels like it's eating you alive — I'm not going to tell you to quit. I'm not going to tell you what to do. But I'll tell you this: the thing you're feeling has a name. It's the gap between what the career was supposed to be and what it actually is.

Naming it is the first step.
