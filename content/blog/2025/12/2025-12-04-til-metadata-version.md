---
created: "2025-12-05T00:29:10Z"
updated: "2025-12-05T00:29:10Z"
title: "TIL: importlib.metadata.version"
description: "Apparently __version__ can be dynamic now."
tags:
  - TIL
  - python
  - pyproject.toml
  - uv
series: TIL
---

While I was [updating my standard `pyproject.toml` to use dependency groups](/blog/2025/12/dependency-groups.html), I switched to using `uv` as my build backend (from `setuptools`). Like all the other design choices, it has very sensible defaults with good overrides when you need them.

One thing that it doesn't support is dynamic versions (i.e. reading `__version__` from `__init__.py`). [Charlie Marsh explains](https://x.com/charliermarsh/status/1805196878545342663):

> Using dynamic metadata for things that are actually just static lookups feels like the wrong tradeoff.
>
> Like `version = ["dynamic"]` to read the version from `__init__.py`.
>
> As soon as you have dynamic metadata, you need to install dependencies and run Python just to get that info.
>
> ---
>
> Static metadata rules. Just write the version out twice!

This makes sense, but I really didn't want to write out the version twice. Luckily, `uv` has a nice `uv version` command to change/bump the version number in the `pyproject.toml`, so I started thinking about how I'd _also_ change the version in the `__init__.py` at the same time.

I asked ChatGPT what the best approach was and it suggested something quite different: don't write the value in `__init__.py` at all.

```python
from importlib.metadata import version, PackageNotFoundError
try:
    __version__ = version("package-name") # from pyproject.toml: project.name
except PackageNotFoundError:
    __version__ = "0.0.0" # aka unknown version
```

I have since noticed that this was also the suggestion [Adam Johnson had in the same thread](https://x.com/AdamChainz/status/1805205201357308413).

One minor concern I have is whether this works in a [`cosmofy`](https://github.com/metaist/cosmofy) build, but that will be a separate exploration.
