<!-- template: blog -->
# Why I built my own static site generator

<details open>

<summary><b>The backstory</b></summary>

<br />

The website you're currently on was built using a static site generator called Teeny.

Until yesterday, Teeny wasn't even an idea. It didn't exist at all, not even in my mind.

You see, for a long time I've been wanting to launch a personal blog. 

I used to be a [regular writer of technical content](https://yakkomajuri.medium.com/) (which I unfortunately don't find a lot of time for these days), but I was yearning for a home to publish more unpolished, personal, "stream of consciousness" pieces.

I love writing, and just want to have something to motivate me to keep on doing it, even if nobody's reading.

The problem is, I suffer from a condition most programmers are awfully familiar with: a knack for adding more and more scope to side projects, to the point where they get dropped and never see the light of day.

On so many weekends I started building a blog using all the right tools and technologies, writing clean code, making it "spark joy", and then got to Sunday evening with yet another repo in hand that I'd never revisit.

So a few weeks ago, I broke the cycle. I put this live:

![Blog v1](./img/teeny/website.png)

It was a poorly-coded ugly thing written in vanilla HTML. But it was much better than everything else I built for a simple reason: it went live.

This was a great start, but, unfortunately, it did lack the one thing I'd want for my blog: the ability to write in Markdown.

Markdown is the best thing since sliced bread, so my blog could suck, but it better be able to parse Markdown - if I have to "write in HTML", I certainly won't be motivated.

So I turned to Jekyll. Jekyll is natively supported by GitHub pages, and with a few clicks in the GitHub UI you're all up and running.

This was nice, but I lost the flexibility I would have wanted to customize the blog pages a bit - GitHub let's you pick a theme and that's that.

This was a result of the native integration with GitHub pages - if I had set Jekyll up myself I'd have had the control I needed. But I'm not a big Ruby fan, so I scrapped that idea.

So, once again, I turned to a tool I'm actually reasonably familiar with: Gatsby.

Gatsby is great, and I've worked with it quite a bit. 

At PostHog, [our website is built with Gatsby](https://github.com/PostHog/posthog.com), and I've leveraged a lot of Gatsby's tooling (including the "lower level" stuff) to get things done when I was working on it.

This should be my comfort zone.

I went on the Gatsby website, picked a theme, and went to work. And right away, the problem was clear: this is too much.

A lot of Gatsby blog themes try to make things "easier" for you by abstracting away the internals and exposing a `config.js` file, where you add your name, a bio, some links, and Gatsby does the rest. 

But that comes at a cost. And that cost was made clear by me hunting the favicon file in the directory for a while only to find that some plugin auto-generated it based on a path for a profile photo you could set in the config.

I really don't need all of this.

And thus, back to square one.

At this stage, the options were: spend a little bit of time doing some research and probably find a tool that would suit me, or build a tool myself to do exactly what I needed and nothing more.

You already know what happened.

</details>


<details open>
<summary><b>Introducing Teeny</b></summary>

<br />

Teeny is 
 
</details>






_First published: 10/10/2021_

