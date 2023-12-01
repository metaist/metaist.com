---
created: "2023-05-18T05:55:38Z"
updated: "2023-11-28T17:09:10Z"
title: 2023-05-14 Weekend Notes
slug: 2023-05-14-weekend-notes
tags:
  [
    "note",
    "Shalev NessAiver",
    "ruff",
    "ezq",
    "pylint",
    "flake8",
    "chatgpt",
    "shields.io",
    "eleventy",
  ]
---

## Releases

- I released [ezq 2.0.3](https://github.com/metaist/ezq/releases/tag/2.0.3) which adds a new class-based API for interacting with a `Queue`.

## Experiments

- [`ruff`](https://github.com/charliermarsh/ruff) (via **Shalev NessAiver**): I tried this python linter during my recent builds of `ezq` and it was very fast and the no-config version generally catches the things I care about. `pylint` does catches a few things I care about, but it's so slow and obnoxious about things I **don't** care about it, that I'm probably going to drop it going forward. I'll probably drop `flake8` too because it doesn't add anything beyond `ruff`.

- Shalev NessAiver and I tried to get ChatGPT v4 to help us build a Svelte component to interact with a Jupyter notebook. Unfortunately, it pointed us at a bunch of outdated libraries, but it was definitely better than Bard.

- ChatGPT v4 kinda helped me figure out what I needed to do to make the `/pypi/pyversions` endpoint at [shields.io](https://shields.io/badges/py-pi-python-version) display supported python versions for my packages. At first, it kept pointing me to the `python_requires` field in `setup.py`, but then it told me to look at the PyPI JSON endpoint, and finally I got it to tell me about the [shields.io github repository](https://github.com/badges/shields/blob/23c0406bedfc6930735e8f5ea75dfe34faf1f290/services/pypi/pypi-python-versions.service.js) where [I finally discovered](https://github.com/badges/shields/blob/23c0406bedfc6930735e8f5ea75dfe34faf1f290/services/pypi/pypi-helpers.spec.js#L10) that it uses the classifiers like `"Programming Language :: Python :: 3.8"` from `setup.py` to build up its list of supported versions.

- [`eleventy`](https://www.11ty.dev/): I watched [this video](https://www.youtube.com/watch?v=kzf9A9tkkl4) which helped me set up this blog.

## Updates

### <span class="rel-date" title="2023-11-28T17:09:10Z">2023-11-28</span>

- Updated broken links.
