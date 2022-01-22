---
template: blog
---

# What's the world's most efficient language?

A while ago I was sitting on a plane and in a moment of boredom picked up the in-flight magazine.

The magazine had a little travel article, and it was written in English on one page and Thai on the other.

The Thai version was so much shorter that I started to wonder if it was more _efficient_. In other words, was it able to convey the same exact meaning to the reader with fewer "resources" than the English version?

The topic came up again when I was speaking to a Japanese man at a language exchange meetup. He said:

> _"You can technically write Japanese without Kanji, but it is a lot less efficient."_

So what is language efficiency? And how can we measure it?

## Thoughts from a nobody

One can't find a lot resources about "language efficiency" very easily, and the majority of my findings related to spoken language. Here are two good reads on this topic for those interested:

- [The World’s Most Efficient Languages](https://www.theatlantic.com/international/archive/2016/06/complex-languages/489389/)
- [Why are some languages spoken faster than others?](https://www.economist.com/graphic-detail/2019/09/28/why-are-some-languages-spoken-faster-than-others)

But I was interested in _written language_, simply because something in me told me I could quantify it, without any knowledge of linguistics.

As you'd imagine, quantifying the efficiency of a language is a complicated task, one that I'm not at all qualified to explore in a scientifically significant way.

But I thought I'd do a little experiment.

Could I gather the same text in various languages that I'm certain (as certain as you can be) conveys the exact the meaning, and then calculate from the language snippets how much information they contain?

If I could do that, I could arrive at some metric: `meaning / amount of information`. 

Meaning is supposed to be a constant, thus the more information the body of text contains, the lower its "meaning per piece of information" ratio, making the language less efficient. 

In essence, if we take information to be `information = noise + signal`, we're looking for the noise ratio of languages - how much stuff is in there that doesn't need to be?

So how could I derive that information value?

## Deriving information

When brainstorming about this, a few immediate indicators might come to mind, like total number of characters. 

Characters, however, are not very uniform - they vary widely within and across languages. Consider:

| Mandarin (Simplified) | Finnish | 
| :-----: | :-----: | 
| 我爱咖啡 | Minä rakastan kahvia |

> _Both sentences say "I love coffee"._

If we're counting characters, Mandarin blows Finnish out of the water in efficiency. 

But most people looking at this will immediately notice that Mandarin characters are much more condensed. They make up for in "complexity" what they're missing in length.

And that "complexity" is what we're looking to measure.

Now imagine I gave you a task to try and find a pattern in the following 2 different images. The task is "done" when you either find a pattern or decide you can't come up with one.

Which would take your brain more time to conclude - A or B?

| A | B |
| :-: | :-: | 
| ![Low info](./img/language/low-info.png) | ![High info](./img/language/high-info.png) |

I believe the answer would be B for most of us.

B has more information, more data - in this case, "pixels" - that our brain needs to process before it makes sense of what it is seeing. 

The same should hold true of characters. When reading, in order for our brain to determine the meaning of the character it is seeing (if it even knows it), it needs to take in all the pixels making up that character and run them across its "database" of known patterns to find a hit.

So there's my information metric: pixels.

To derive the amount of information present in a snippet of text, we can count the total "used" pixels i.e. on a black-on-white representation, count the black pixels.

Now, at this point I will mention once again that a true analysis of efficiency should be much more nuanced, and it's not something I'd be able to undertake.

A friend, upon hearing about this idea, said the only thing I'm really measuring is efficiency from the perspective of printer ink. But so be it, I'll measure that.

## Approach

This post is bound to get long, so I'll spare many of the details here. But essentially, in order to test this out, I did the following:

**1: Selected a snippet of text that I would be likely to find good translations for in various languages**

For this I landed on the Google Privacy Policy. And not the whole thing either. A tiny piece. So tiny that a real scientist would laugh at the idea of this whole thing even being called "an experiment".

But you must keep in mind the name of this blog: "Sunday Afternoon". Stuff contained here is often done over a single weekend just for the fun of it, as was the case with this, so I needed to keep things simple.

Nevertheless, I picked the Google Privacy Policy because:

1. I could easily scrape it in 100s of languages
2. It needs to convey the exact same meaning in all languages
3. It has legal implications, meaning if Google puts it up online in a language, it must have been throughouly checked
4. Google probably knows a thing or two about translations

The exact snippet I picked was:

> _"When you use our services, you’re trusting us with your information. We understand this is a big responsibility and work hard to protect your information and put you in control. This Privacy Policy is meant to help you understand what information we collect, why we collect it, and how you can update, manage, export, and delete your information."_

And I verified it said exactly this in English, Portuguese, Spanish, Finnish, German, and Icelandic (the last 2 with external help).

**2: Pull and parse the data**

For this I got a list of all existing locales, and pulled all the HTML from each language's privacy policy from `https://policies.google.com/privacy?hl=<locale>`.

I then found the desired paragraph and extracted it into a separate file for each language.

For the more technical readers, the paragraph's CSS selector was consistent across all languages, which is how I managed to extract it. It's easy to confirm you extracted the right thing by popping the snippet into a translator.

**3: Map out how many pixels each character takes**

Once I had all the clean data, I iterated over every character in the dataset and drew an image for each using Python's [Pillow](https://pillow.readthedocs.io/en/stable/releasenotes/9.0.0.html) library.

From that image I could then count the total number of black pixels and generate a map of the results.

Here are the basics of how this works:

```py
arial_unicode = ImageFont.truetype('/Library/Fonts/Arial Unicode.ttf', 60)
img = Image.new('RGB', (200, 200), 'white')

draw = ImageDraw.Draw(img)
draw.text((75,0), letter, font=arial_unicode, fill='#000000')

pixels = list(img.getdata())
total_black_pixels = len(list(filter(lambda rgb: sum(rgb) == 0, pixels)))
```

**4: Build up the results**

Having determined the black pixel value (information) for each character, I could then derive how much information (again, in my limited definition), each language's written representation was using to convey the same meaning.

> Some manual intervention here was needed, and I ended up looking through **every picture** of a character that the script generated to make sure it was valid. Two key things here were removing squares drawn when the font didn't support a language or some of its characters (e.g. Amharic), as well as making sure the drawings were containing the full character.


## Results

The most efficient language prize in my little child experiment was Gujarati, followed by Hebrew and then Arabic. These were all languages that also had a very low mean pixel/character ratio compared to others.

The least efficient ones were Japanese, Malay, and Canadian French. You heard that right. Out of all the French dialects included in the dataset, Canadian was the only one with different wording. I'd be curious to hear from someone who speaks French about whether the differences are indeed core to how the language is structured or merely a dialect thing. 

English, by the way, was eighth on the list (if dialects are only counted once).

Something I also found interesting was looking at the results for the various listings of Chinese. Simplified Chinese was unexpectedly more efficient, and Chinese characters use around 3-4 times more pixels than most languages (excluding Japanese and Korean), if you ever wanted to put a concrete number to their "complexity".

There are lots of other interesting things to see in the results, so you can find them in a table format on this website [here](blog/language-information-density-results) and the CSV results [here](gh).

So yeah, if you need to put some fliers out and your audience understands every language there is, use Gujarati to save in printing costs.