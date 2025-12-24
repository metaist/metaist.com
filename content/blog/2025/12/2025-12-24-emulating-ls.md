---
created: "2025-12-24T05:38:21Z"
updated: "2025-12-24T05:38:26Z"
title: "cosmofy fs ls: emulating GNU ls"
tags:
  - ls
  - python
  - cosmofy
  - Charlie Marsh
series: cosmofy
description: "How much of GNU ls should I emulate in Python?"
---

_Previously_: [pythonoid](/blog/2024/09/pythonoid.html), [baton](/blog/2025/12/emulating-astral-cli.html)

When I was designing the low-level zip file manipulation tools for `cosmofy`, I wanted an easy way to see the contents of the bundle. We're so used to using `ls` for looking into directories that I thought it would be cool to emulate as much of `ls` as I could.

But then it turned out that `ls` has a [crazy number of options](https://www.gnu.org/software/coreutils/manual/html_node/ls-invocation.html). I actually [went through them all](https://github.com/metaist/cosmofy/issues/35) and tried to figure out if it was possible to support them.

But then I realized this was insane. First, many of the options are just aliases for slightly more explicit options. Charlie Marsh would never have a `-t` that was an alias for `--sort=time`. Why should I?

In the end I decided to go with the most common options (sorting, list view), a couple that were easy to implement, and a few longer-form ones that cover most of the aliases.

I'm pretty happy with the [way it turned out](https://github.com/metaist/cosmofy#cosmofy-fs-ls).
