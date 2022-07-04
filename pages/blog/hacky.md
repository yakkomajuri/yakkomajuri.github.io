---
template: blog
---

# This website is hacky AF

_03/07/2022_

The website you currently find yourself on is **really** hacky.

Here's a quick summary of the hacky things you might find on it. 

Trust me - it gets better as you go.

## Core

First of all, the website uses a feature-poor custom static site generator I wrote in a few hours called [Teeny](/blog/teeny).

Teeny has effectively one goal: converting Markdown to usable HTML. 

Beyond that, the website is just poorly written HTML, JavaScript, and CSS. Oh, and [Pico.css](https://picocss.com/) for minimalistic styling.

## Hosting

This website is static and uses GitHub Pages for hosting. It is deployed with this command:

```bash
teeny build && echo yakkomajuri.com > public/CNAME && gh-pages -d public/
```

Teeny didn't have a good story for placing arbitrary files at the root of the output directory so rather than build that in I just create GitHub's required `CNAME` file with the deploy command each time. 

Works like a charm.

## Comments

Nobody's ever left one, but the blog supports commenting. To do that, it uses [utterances](https://utteranc.es/), which uses GitHub as the "backend" for the comments engine. 

Comments are published on the public repo for this website and displayed here. 

Takes 5min to set up - it's beautiful.

## Analytics

I self-host [PostHog](posthog.com) on Digital Ocean to collect anonymized data about pageviews and clicks.

However, more interestingly, I use PostHog for non-analytics things, as you'll see next.

> Disclaimer: I work at PostHog

## Newsletter

A little while ago I decided that it could be worth it to set up a newsletter for this blog. 

An email has never been sent (and probably never will - I've sucked at keeping up newsletters in the past) but I was interested in having some fun building it.

So to avoid having to use another service - I decided to build a PostHog app to manage this for me.

Thus, when you input your email and press subscribe, an event is sent to PostHog. 

The event eventually reaches [this app](https://github.com/yakkomajuri/posthog-newsletter-plugin/blob/main/index.js), which stores the email. Events can also be used to remove subscribers.

But even more ambitiously, my goal is to automate the entire newsletter sending process as well. I hope to at some point have the following setup:

1. GitHub action detects that a new blog post has been added 
2. GitHub action sends an event to PostHog with the newsletter content
3. The newsletter app pulls the subscribers and triggers an email to be sent to all of them with the content (either in PostHog itself or via something like Mailgun or even Zapier for extra hacky points)

## Forms

I also decided to use PostHog as my backend for miscellaneous form submissions.

I recently put [this odd experiment](https://yakkomajuri.com/recruit-me) live, where I ask recruiters to fill out a form to talk to me (outrageous!), and I send the responses to PostHog.

There, I can actually create visualizations of role offered, benefits, salary, and so on, which allows me to more easily sort through the noise.

I also run Zapier on their free tier, and took 15min to set up a workflow that emails me the details of the form submission when the event appears in PostHog. I'm expecting these to be few and far between, so being notified of them should be useful.

## A gift for my girlfriend

I've also used this website to set up a little gift for my girlfriend.

An unlisted page on this site contains a list of questions related to our relationship to be used as prompts for fun and nostalgic conversations.

While there's nothing crazy in there, I didn't necessarily want to have these out in the open, so I decided a password would do the trick. 

But this is a static website with a public codebase and no backend, so what could I do?

Well, I ran the content through AES256 and made the ciphertext is publicly available on the source code. On the gift's page, when a password is attempted, a little script tries to decrypt the cipher, and if it manages, some content should appear. 

You're more than welcome to try to brute force it if you really have nothing better to do :D

## You might also find...

- Small custom scripts for things like loading images gradually or displaying the reading progress on blog pages
- A [snake game written in Brython](/brython-snake) (Python for the browser)
- ...more things in the future

