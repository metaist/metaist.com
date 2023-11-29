---
author: The Metaist
tags: [math, Daniel Bitran]
title: fMRI & False Positives
---

_This post is based on a submission by reader
**[Professor Daniel Bitran][daniel-bitran]**._

[daniel-bitran]: http://www.linkedin.com/pub/daniel-bitran/b/989/ba1

## Definitions

[<abbr title="Functional Magnetic Resonance Imaging">fMRI</abbr>](http://en.wikipedia.org/wiki/Fmri)
is a way of measuring blood-flow in the brain or spinal cord and,
by extension, neural activity in those areas. A
[false positive](http://en.wikipedia.org/wiki/Type_I_and_type_II_errors)
is the sort of mistake your smoke detector makes when it goes off,
but there's no smoke.

## Summary

<div class="entry-summary" markdown="1">

Despite the widespread use of fMRI, a few false positives may result in inaccurate results.

</div>

<figure markdown="1">

![Salmon FMRI]({{thumbnail}})

<figcaption>
  The fMRI is showing neural activity, but the salmon is definitely dead.
  <address markdown="1">

(Image: Courtesy of [Prefrontal.org][1])</address>

</figcaption>
</figure><!--more-->

## Commentary

The image above is striking because the false positives seem to show neural activity
in a dead salmon's brain. According to
[researchers at UCLA Santa Barbra][1],
these errors are due to a problem of
[multiple comparisons](http://en.wikipedia.org/wiki/Multiple_comparisons).

Imagine we're playing
[One of These Things is not Like the Others](http://en.wikipedia.org/wiki/Sesame_Workshop)
with several tin cans of Atlantic salmons. At first, it's hard to tell which one is not
like the others&mdash;there's a bunch of canned salmon. They have similar color,
weight, shape, etc. But as we add different ways of comparing the cans (or more cans
to compare), we increase the probability that there will be _some way_ in which one
of them differs from the rest&mdash;particularly because of small differences, say
manufacturing defects.

[**Note:** Corrections appreciated.] Now imagine we're collecting data for an fMRI.
Each each point (called a
[<abbr title="volumetric pixel">voxel</abbr>](http://en.wikipedia.org/wiki/Voxel))
is measured several times with certain extreme values discarded. Now we want to figure
out which of the voxels is not like the others&mdash;that's because that's where we expect
to see [differences in blood flow](http://en.wikipedia.org/wiki/Hemodynamic_response).
However, by comparing voxels we're actually comparing multiple measurements of each voxel
to multiple measurements of other voxels. This is like adding more ways of comparing the
cans. Moreover, because there is a small bit of noise, the measurements for each voxel
can be slightly different each time. This is why we occasionally find _some difference_
between neighboring voxels that isn't really there&mdash;it's a false positive.
Luckily there are ways of
[correcting for this sort of error](http://en.wikipedia.org/wiki/Multiple_comparisons#Methods),
but unfortunately, it is not applied as frequently as it should.

## Meta

What are other examples of widespread errors of multiple comparisons or false positives?

## Acknowledgements

Thanks to **[Craig Bennett](http://prefrontal.org/blog/about/)**
of <span class="vcard org fn">Prefrontal.org</span>
for providing a high resolution version of the Atlantic salmon fMRI.

## See Also

- <cite>[Human Brain Mapping 2009 &ndash; Presentations][1]</cite>
  at <span class="vcard org fn">Prefrontal.org</span>
  for the conference posters & slides.

- <cite>[Multiple Comparisons with Repeated Measures][2]</cite>
  by <span class="vcard fn">David Howell</span>
  for a lengthy discussion on the subject.

- <cite>[The Importance of Numeracy](/blog/2009/11/importance-of-numeracy.html)</cite>

[1]: http://prefrontal.org/blog/2009/06/human-brain-mapping-2009-presentations/
[2]: http://www.uvm.edu/~dhowell/StatPages/More_Stuff/RepMeasMultComp/RepMeasMultComp.html
