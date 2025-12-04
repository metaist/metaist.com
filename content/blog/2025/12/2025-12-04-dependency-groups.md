---
created: "2025-12-04T19:00:54Z"
updated: "2025-12-04T19:00:54Z"
title: "Dependency Groups to the Rescue"
tags: ["python", "pyproject.toml", "uv", "Simon Willison"]
description: "Finally a standard place to put dev dependencies."
series: pyproject.toml
---

_Previously_: [Stop Hiding Python Dev Dependencies][prev]

[prev]: /blog/2024/07/python-dev-deps.html

I'm a bit late to the party, but even when I saw that [PEP 735 – Dependency Groups in pyproject.toml](https://peps.python.org/pep-0735/) had been accepted and [standardized by PyPA](https://packaging.python.org/en/latest/specifications/dependency-groups/#dependency-groups), it still didn't register how this should impact my `pyproject.toml` configurations.

In my [previous post][prev], I argued that absent a standard place to put dev dependencies in `pyproject.toml`, we should opt to use `optional-dependencies`. However, dependency groups seem to offer a nice standard place for such dependencies: these are bundles of dependencies that **don't** get built into the final distribution (i.e. they are not required to run the package).

Feels like the best of both worlds and `uv` already started using `dependency-groups.dev` as the place that `uv add --dev` writes to and this group is sync'd by default when using `uv sync` and `uv run`.

I only really got this when I read Simon Willison's post about [how he's using dependency groups](https://til.simonwillison.net/uv/dependency-groups) to make it easier for people to hack on his code.
