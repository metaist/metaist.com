---
published: "2013-03-06T00:00:00Z"
updated: "2023-11-28T17:09:10Z"
title: "Genome Compiler"
tags: ["biology", "software"]
video: "F8qcDQaY8Mw"
---

## Summary

<div class="entry-summary" markdown="1">

[Genomics][wiki-1] is the study of genetic material. A new tool for editing
genes makes it easier to manufacture synthetic life.

</div>

[wiki-1]: http://en.wikipedia.org/wiki/Genomics

<figure markdown="1">

<iframe width="560" height="315"
  src="http://www.youtube.com/embed/{{video}}?rel=0"
  frameborder="0"
  allowfullscreen></iframe>
<figcaption>
  <address markdown="1">

(Video: [YouTube](http://www.youtube.com/watch?v={{video}}))</address>

</figcaption>
</figure><!--more-->

## Commentary

[Omri Amirav-Drory][linked-1] makes a tantalizing case for comparing genomics
to programming:

> ... it's just software&mdash;it's software that writes it's own hardware,
> but it's just software.

However, programmer shouldn't expect a smooth transition. There are a few
key differences that I've already noticed while playing with the
[beta Genome Compiler][genome-1] which need to be alleviated to make tinkering
easier.

### Different Mental Model

At it's core, software is about [computation][wiki-2] (that's why they're
called _computers_). The concepts you first learn about are inputs, outputs,
and manipulations. Your first program is something like `print "Hello World."`.
From those small pieces you can build larger and larger structures until you
create a new environment (e.g., an [operating system][wiki-3]).

Genetic material, on the other hand, is focused on (re)production. While there
are initialization blocks (I can imagined what the
`chromosome replication initiator` might do) and conditional branches for
different parts (a short virus had multiple variants of legs),
most parts of the genome focus on the production of chemicals whose
subsequent effects are the ultimate things of interest to me as a designer.
Barring an understanding of the chemical being produced, I cannot make sense
of what I'm manufacturing.

### Poor Documentation

To try and make sense of what's going on, I looked at the reference information
provided when you click on a block. I presume the information is useful
to practitioners, but it is extremely opaque to non-experts (Oh, this block
produces `spore peptidoglycan hydrolase`! What's that do?). Of course, we ought
not neglect how this information was obtained in the first place. The analogy
of giving iPads to cavemen is apt&mdash;we've had to reverse-engineer this
highly complex entity one piece at a time.

Nonetheless, for real tinkering to take off, the building blocks need to be
easier to reason about (think [Scratch][mit-1] for genomes).

### No Debugging

After about an hour of playing around, I ended up splicing a bunch of random
genetic material together from different creatures, but still had no idea what
it would do. Moreover, there wasn't any way for me to step through my creation
and see the consequence on the environment (even a highly artificial one).

When programming, being able to stop the program and inspect it's goings on
gives you an insight which is hard to get when you only look at the finished
product.

### Still Awesome

This is the kind of development which opens up the possibility of dramatically
expanding our understanding and control of the world at several different
levels.

First, we can now start talking about actual, mass-produced nano-manufacturing.
The recent finding of a [cicada which physically shreds bacteria][phys-1]
further pushes the idea that we'll soon be creating materials with tiny
features for productive use.

Next, we can open up the number of people who can participate in this
once-reclusive field. Open Source biology is a natural consequence.

Finally, we should expect the field of immunology to explode as safe-guards for
the diabolical creations of the masses need to be manufactured.

Overall, this is an exciting development, much like the development of early
computing, but with far-reaching consequences for life on the planet.

## See Also

- <cite>[Genome Compiler][genome-1]</cite> for the genomics tool.
- <cite>[Scratch][mit-1]</cite> for the programming environment.

## Updates

### <span class="rel-date" title="2013-06-16T16:37:00-04:00">2013-06-16</span>

- See <cite>[Glowing Plants: Natural Lighting with no Electricity][kick-1]</cite>
  for the Kickstarter project to create glowing plants using Genome Compiler.

[genome-1]: https://web.archive.org/web/20130305123624/http://www.genomecompiler.com/download-page/
[linked-1]: http://www.linkedin.com/pub/omri-amirav-drory/27/727/505
[mit-1]: http://scratch.mit.edu/
[wiki-2]: http://en.wikipedia.org/wiki/Computation
[wiki-3]: http://en.wikipedia.org/wiki/Operating_system
[phys-1]: http://phys.org/news/2013-03-cicada-wing-bacteria-contact-video.html
[kick-1]: http://www.kickstarter.com/projects/antonyevans/glowing-plants-natural-lighting-with-no-electricit

## Updates

### <span class="rel-date" title="2023-11-28T17:09:10Z">2023-11-28</span>

- Updated broken links.
