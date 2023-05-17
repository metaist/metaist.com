---
author: The Metaist
tags: [math]
title: "Anscombe's Quartet"
---

## Summary

<div class="entry-summary" markdown="1">

[Anscombe's quartet][wiki-1] was created by [Francis Anscombe][wiki-2]
to demonstrate the effect of [outliers][wiki-3]. All four datasets have
the same [average][wiki-4], [variance][wiki-5], [correlation][wiki-6],
and [linear regression][wiki-7], but look completely different when graphed.

</div>

[wiki-1]: http://en.wikipedia.org/wiki/Anscombe%27s_quartet
[wiki-2]: http://en.wikipedia.org/wiki/Francis_Anscombe
[wiki-3]: http://en.wikipedia.org/wiki/Outlier
[wiki-4]: http://en.wikipedia.org/wiki/Mean
[wiki-5]: http://en.wikipedia.org/wiki/Variance
[wiki-6]: http://en.wikipedia.org/wiki/Correlation_and_dependence
[wiki-7]: http://en.wikipedia.org/wiki/Linear_regression

<figure markdown="1">

![Graphs of Anscombe's quartet]({{thumbnail}})

<figcaption markdown="1">

[Lies, damned lies, and statistics!](http://en.wikipedia.org/wiki/Lies,_damned_lies,_and_statistics)

  <address markdown="1">

(Image: [Wikimedia](http://commons.wikimedia.org/wiki/File:Anscombe%27s_quartet_3.svg))</address>

</figcaption>
</figure><!--more-->

## Commentary

Anscombe's quartet is a neat example of how even large differences between
datasets can be hidden by outliers. There is a false sense that the sets are
comparable in some way just because they share many statistical properties.

Luckily, a simple graph of the sets reveals the effect. However, graphs
can deceive in several other ways:

- **Captions** - A graph's caption can create an expectation that will distort
  our perception of the graph (the same applies to [photographs][wiki-8]).

- **Playing with Scales** - There are several ways this can be accomplished:

  1. A compressed or expanded scale can make changes seem larger or smaller.
  2. Gaps in the scale can make it harder to make judgments of how large a value is.
  3. Different scale units or sizes can make direct comparison between two datasets
     seem possible&mdash;even when it doesn't make any mathematical sense.

While I'm interested in the best techniques for presenting data,
it's important to understand that there is more to the experience of reading
graphs than just presenting the information&mdash;our choice of presentation
can divert the reader away from the underlying truth about the data.

[wiki-8]: http://en.wikipedia.org/wiki/2006_Lebanon_War_photographs_controversies#Allegations_of_improper_captioning

## See Also

- <cite>[Anscombe's quartet][wiki-1]</cite>
  at <span class="vcard org fn">Wikipedia</span>

- <cite>[Misuse of statistics][wiki-stats]</cite>
  at <span class="vcard org fn">Wikipedia</span>
  for some other ways that statistics can be misused.

- <cite>[Most Misleading Graphs](http://dpcdsb-gains.wikispaces.com/file/view/Worst+Graphs+Ever.pdf)
  for an interesting set of graphs.

- <cite>[How to Lie with Statistics][amazon-1]</cite>
  at <span class="vcard org fn">Amazon</span>
  for a humorous approach.
  ![.](http://www.assoc-amazon.com/e/ir?t=themet-20&l=as2&o=1&a=0393310728&camp=217145&creative=399369)

[amazon-1]: http://www.amazon.com/gp/product/0393310728/ref=as_li_ss_tl?ie=UTF8&tag=themet-20&linkCode=as2&camp=217145&creative=399369&creativeASIN=0393310728
[wiki-stats]: http://en.wikipedia.org/wiki/Misuse_of_statistics
