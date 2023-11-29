---
author: The Metaist
tags: [math, health]
title: Disease Screening & Base Rate Fallacy
---

## Definition

<div class="entry-summary" markdown="1">

The [base rate fallacy][wiki-base] refers to the neglect of
[prior probability](http://en.wikipedia.org/wiki/Prior_probability)
of the evidence that supports the
[conditional probability](http://en.wikipedia.org/wiki/Conditional_probability)
of a hypothesis. <small>(Based on [Wikipedia][wiki-base])</small>

</div>

[wiki-base]: http://en.wikipedia.org/wiki/Base_rate_fallacy

<figure markdown="1">

![Needle in a haystack]({{thumbnail}})

<figcaption>
  <address markdown="1">

(Photo: [Amy](http://www.flickr.com/photos/mayaevening/138372058/in/photostream) at Flickr)</address>

</figcaption>
</figure><!--more-->

## Commentary

A recent example is the [controversy about breast cancer screenings](http://www.nytimes.com/2009/11/19/health/19cancer.html).

Imagine that about 1% of women (1 in 100) have breast cancer. You have a
diagnostic test that correctly detects cancer 85% of the time (i.e. if the test
is given to 100 women **with cancer**, it catches 85, but misses 15 of them).

Also, the test sometimes incorrectly detects cancer (when none is present) about
10% of the time (i.e. if the test is given to 100 women **without cancer**, it
accidentally tells 10 of them they have cancer, but correctly tells the other 90
they don't have cancer).

Now the tricky bit: Imagine we give the test to 1,000 women in the population.
If the test says a women has cancer, what is the probability she _actually_ has
cancer?

This question is hard for many people (including doctors!) because it's hard to
make the trade-offs in our head about whether or not the test is accurate for
_this particular woman_. Here's how you would do the calculation correctly:

1. Based on the rate of cancer in the population (1%), how many of the 1,000
   women tested do we expect to have cancer?

   **Answer:** About 10.

2. Of those 10 who have cancer, about 9 will be told they have cancer, and 1
   will missed.
   <br /><small>(Recall, the test only catches 85% of cancers.)</small>

3. Now of the remaining 990 women who don't have cancer, about 99 of them will
   be told they have cancer (10% false-alarm) while the rest (891) will be
   correctly told they don't have cancer.

4. So how many women are **told** they have cancer?

   **Answer:** 9 + 99 = 108.

5. How many of those women **actually have** cancer?

   **Answer:** Just the 9.

6. So if you're told you have cancer, what's the chance you actually have
   cancer?

   **Answer:** 9 / 108 = 8.3%

Pretty strange, right? What about the people who are told they
**don't have cancer**? What's the probability you actually _do_ have cancer?

1. How many women are **told** they _don't_ have cancer?

   **Answer:** 1 + 891 = 892.

2. How many of those **actually have** cancer?

   **Answer:** Just the 1.

3. So if you're told you don't have cancer, what's the chance that you
   actually _do_ have cancer?

   **Answer:** 1 / 892 = 0.1%

That means that it's pretty unlikely for you to have cancer if the test says you
don't.

The reason this occurs is because the number of women who have breast cancer
_to begin with_ is not that high (10 of 1,000). Therefore, the mistakes the test
makes start to matter when applied to the entire population.

Naturally, this has policy implications: if you test more and more people, a
large percentage of people will be told they have cancer when they don't&mdash;
leading to more invasive testing that has other real side-effects. The trick is
either to try to test a high-risk subpopulation (where the prevalence rate is
higher) or to improve the test by reducing its false-positive rate.

## See Also

- <cite>[Screening for disease and dishonesty](https://web.archive.org/web/20100211135919/https://understandinguncertainty.org/node/238)</cite>
  at <span class="vcard org fn">Understanding Uncertainty</span>
  for an excellent interactive representation of base rates.

- <cite>[Screening for Breast Cancer](https://web.archive.org/web/20100820220942/https://uspreventiveservicestaskforce.org/uspstf/uspsbrca.htm)</cite>
  at the <span class="vcard org fn">U.S. Preventive Services Task Force</span>
  for a summary of its recommendations.

- <cite>[The base rate fallacy reconsidered](https://web.archive.org/web/20090608214008/http://www.bbsonline.org/Preprints/OldArchive/bbs.koehler.html)</cite>
  for a counter-argument about base rate neglect.
