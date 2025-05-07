---
created: "2025-05-07T23:08:33Z"
updated: "2025-05-07T23:08:33Z"
title: "Trying ty, Astral's type checker"
description: "It's not done, but very fast."
tags: ["python", "typed", "ty", "castfit", "Patrick Kage"]
series: "typed"
via:
  known: True
  name: Patrick Kage
---

Astral has been delivering impressive improvements to the Python ecosystem with `ruff`, taking over `rye`, and releasing `uv` to manage projects and Python installs. And there have been musings about when they'd release a type checker.

Well the alpha release is now here (via **Patrick Kage**). You can try it out:

```bash
# requires rust to compile
curl https://sh.rustup.rs -sSf | sh
uv add git+https://github.com/astral-sh/ty
uv run ty check
```

Note: It takes a little bit of time to compile `ty`, but like all the other Astral tools it runs very quickly.

Also: Fair warning, lots of stuff doesn't work yet. For example, when I tried it on my `castfit` library, it choked on `dict()` (see [#100](https://github.com/astral-sh/ty/issues/100)).

How long before `ty` replaces `mypy` and `pyright` in my build process for all my projects? I'll probably wait for the official release, but I'll probably try it at least once on all my projects just to see what it produces.
