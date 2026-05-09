---
title: "17,000 Requests Per Second: What Happened When I Pressure Tested Laravel Cloud with k6"
description: "I pointed k6 Cloud at a Laravel 12 app on Laravel Cloud with autoscaling enabled. Here's what 20,000 virtual users, an hour of sustained load, and a database bottleneck taught me."
pubDate: "Mar 19 2026"
heroImage: "../../assets/laravel-cloud-pressure-test.png"
---

I had a Laravel 12 app sitting on Laravel Cloud with autoscaling turned on and no real traffic hitting it. That bothered me.

Not in a "this is a problem" way. More like — I'm a Solutions Engineer at Laravel. I talk to customers every day about what Cloud can handle. One of those customers had a setup I wanted to put through its paces. And I'd never actually pointed a serious load testing tool at Cloud to see what happens.

So I did.

I set up k6 Cloud through Grafana, built a custom endpoint designed to simulate realistic traffic patterns, cranked it to 20,000 virtual users, and let it run for an hour.

The result: 17,000 requests per second, sustained. Autoscaling handled it. The app didn't flinch.

Here's exactly what I tested, how I set it up, and what the numbers actually looked like.

## The Test Setup

Before I get into results, the setup matters. If you've ever read a benchmarking post where someone hammers a health check endpoint and claims victory, you know why.

I didn't want to test a hello world route. I also didn't want to overcomplicate it with database calls on the first pass — I wanted to isolate the platform first. Can Laravel Cloud handle serious connection volume and autoscaling pressure on its own, before we start layering in other variables?

So I built this:

```php
private function jitterDelayMs(): int
{
    $slowProbability = config('loadtest.slow_probability', 0.15);
    $useSlowPath = (mt_rand(1, 10000) / 10000) < $slowProbability;

    if ($useSlowPath) {
        return config('loadtest.slow_delay_ms', 33_376);
    }

    $min = config('loadtest.fast_min_ms', 2);
    $max = config('loadtest.fast_max_ms', 120);

    return $min >= $max ? $min : mt_rand($min, $max);
}
```

Bimodal response-time jitter. 85% of requests get a fast response — random delay between 2 and 120 milliseconds. The other 15% get hit with a ~33-second delay to simulate slow spikes.

This matters because real traffic doesn't hit your app in uniform waves. You get bursts. You get slow requests holding connections open while fast ones fly through. That 15% slow path at 33 seconds is going to stress connection pooling and autoscaling in ways a flat-latency test never would.

The endpoint sat at `/loadtest` on a standard Laravel 12 app, registered through `web.php`. That means full middleware stack — session handling, CSRF protection, cookie encryption, all of it. Not a stripped-down API route. The real deal.

The app was running on Laravel Cloud with autoscaling enabled, running Nginx/FPM.

## What Happened: 17,000 RPS

I configured k6 Cloud to ramp up to 20,000 virtual users and hold there for an hour.

![Laravel Cloud Application Metrics dashboard showing the full test run](/images/laravel-cloud-load-test-no-db.png)

The platform sustained 17,000 requests per second at peak, settling into the 10-15k range for the sustained portion of the test. Here's the k6 Cloud summary:

![k6 Cloud test results showing 39.6M requests, 17,935 peak RPS, and 157ms P95 response time](/images/laravel-cloud-k6-results.png)

39.6 million requests over the course of the test. 173 HTTP failures — out of 39.6 million. Peak RPS of 17,935. P95 response time of 157ms, and that line barely moved the entire run.

I want to be specific about what that means, because "17k RPS" is easy to say and hard to appreciate. That's roughly a million requests per minute, hammering a single Laravel application, through the full middleware stack, with 15% of those requests deliberately holding connections open for 33 seconds each. And the P95 held at 157ms the whole time.

The autoscaling behavior was wild to watch in real time. The replica count spiked to around 50 during the initial ramp as Cloud scrambled to absorb the sudden load. Then it settled into the 10-20 range once the platform found its rhythm.

CPU usage stayed below 150,000 mCore across all replicas. Memory usage stayed low — the large numbers on the dashboard are the aggregate limits across all the replicas, not actual consumption. The HTTP Success donut stayed at 100% the entire time.

And zero replica restarts. Fifty replicas spinning up under heavy load and not a single one crashed.

The platform was doing exactly what it's supposed to do — absorbing the load by scaling horizontally without me touching anything.

No errors. No degradation. No manual intervention. Just the app eating requests for an hour straight.

## The Question You're Already Asking

Yeah. I know.

"But there's no database."

You're right. The jitter endpoint doesn't hit a database. It's simulating latency patterns, not running queries. And if I published this post without acknowledging that, you'd be right to call it out.

Here's why I did it this way: I wanted to isolate the platform first. If I threw a database into the mix from the start and saw degraded performance, I wouldn't know if the bottleneck was Cloud's compute layer, the network, the database, or the interaction between all three.

Testing the platform layer in isolation tells you something specific and useful: Laravel Cloud's compute and autoscaling are not going to be your bottleneck. The infrastructure underneath your app can handle serious load.

But I wasn't going to stop there.

## Test Two: Adding a Database

For the second round, I built something closer to a real application — a simulated chat system. GETs paginate through messages using keyset pagination. POSTs insert random messages with generated usernames.

```php
public function index(Request $request): JsonResponse
{
    $query = DB::table('chat_messages')
        ->orderByDesc('created_at')
        ->orderByDesc('id')
        ->limit(50);

    // keyset pagination logic
    // ...

    $messages = $query->get();

    return response()->json([
        'data' => $messages,
        'next_cursor' => $messages->isNotEmpty() ? [
            'cursor_id' => $messages->last()->id,
            'cursor_date' => $messages->last()->created_at,
        ] : null,
    ]);
}
```

Reads and writes. Paginated queries and inserts. Not a toy endpoint.

The database was PlanetScale Metal Postgres, connected to the Laravel Cloud private network via PrivateLink with PgBouncer available for connection pooling. Why PlanetScale and not Cloud's integrated databases? Because this whole test started from a customer's setup. They were running PlanetScale Metal Postgres, so I matched their stack. I did not tune the Postgres instance for this workload. No connection pool optimization. No PgBouncer adjustments. Out of the box.

This is where things got ugly.

![Laravel Cloud Application Metrics dashboard showing the database test run](/images/laravel-cloud-load-test-with-db.png)

The test peaked at around 4,000 RPS. But that number doesn't tell the real story. Look at that dashboard.

46% error rate. Nearly half of all requests failed — every single error was a database timeout or connection failure. Latency spiked to _hours_. Not seconds. Hours. The requests weren't failing fast. They were hanging, waiting for a database that couldn't keep up, and eventually timing out.

Now look at what Cloud was doing while this happened.

50 replicas running. CPU usage climbed to around 100,000 mCore across all replicas. Memory hit about 128 GiB. Zero replica restarts. Cloud scaled to 50 instances and held them stable the entire time.

The platform was _fighting_ for this app. It scaled aggressively, stayed up, didn't crash a single replica. The compute side did everything right.

The database was the wall.

I want to be extremely clear about something: **this was not a PlanetScale problem.** PlanetScale Metal Postgres is a serious database product. The issue was entirely my configuration — or lack of it. I threw a massive amount of concurrent load at an out-of-the-box setup with no tuning whatsoever. When I later took time to properly configure connection pooling and adjust PgBouncer settings, the scale opened right up. The database handled the load just fine once it was set up for it.

This is a configuration story, not a vendor story.

And that's the interesting finding.

## What This Actually Tells You

If you're evaluating Laravel Cloud for a production workload, here's what these two tests say:

**The platform layer is not your constraint.** At 17k RPS through full middleware with realistic latency jitter, Cloud's compute and autoscaling handled it without breaking a sweat. If your app is slow, it's probably not because of where it's running.

**Your database configuration is almost certainly the bottleneck.** Cloud scaled to 50 replicas and was nowhere near its compute limits during the DB test. It was ready to serve more. The unconfigured Postgres instance was the ceiling — 46% errors, latency in the hours. Once I tuned it, the database kept up. That's not a Cloud problem or a database vendor problem. That's a "you need to tune your database" problem, and it's the same problem you'd have on any platform with any provider.

**Autoscaling works.** I didn't pre-provision anything. I didn't set capacity thresholds. I turned on autoscaling, pointed 20,000 virtual users at it, and Cloud figured it out. For the kind of "I don't want to manage infrastructure" developer Cloud is built for, that's the whole point.

The honest takeaway: if you're planning to run serious load on Laravel Cloud, invest your tuning time in your database layer. The app server side is handled. The database side is where your performance budget gets spent.

## What I'd Do Next

I'm not done with this. A couple things I want to test in a follow-up:

The obvious one is running the database test again with more aggressive tuning — pushing the connection pool sizes higher, testing different PgBouncer modes, maybe throwing even more VUs at it now that the database isn't choking. I want to see where the actual ceiling is when everything is properly configured.

And yeah — I should probably build something even more realistic. Queue jobs, cache hits, the full stack of a real production app under load. The chat endpoint is closer to reality than the jitter test, but there's still room to push it.

## The Disclaimer You're Expecting

I work at Laravel. You know that. I'm not going to pretend this is a disinterested third-party benchmark.

But I also didn't cherry-pick results. The 46% error rate on the database test is right there in the post, screenshot and all. I'm telling you what I found, including the parts that aren't a clean marketing story.

If you want to run your own tests — and you should — k6 Cloud through Grafana is a solid setup. Build an endpoint that simulates your actual workload, not a health check. And tune your database before you blame your platform.

The numbers are the numbers. Do what you want with them.
