---
created: "2025-05-16T16:08:15Z"
updated: "2025-05-16T16:08:15Z"
title: "Trying pyrefly, Meta's type checker"
description: I guess I like trying type checkers.
tags:
  - python
  - typed
  - pyrefly
series: typed
---

[Meta announced that they are open sourcing their type checker, `pyrefly`](https://engineering.fb.com/2025/05/15/developer-tools/introducing-pyrefly-a-new-type-checker-and-ide-experience-for-python/). It was easy enough to try:

```bash
uvx pyrefly check
```

On my tiny 640 lines of `castfit` (which passes `pyright` and `mypy --strict`) I got 74 errors. Going through some of these was instructive.

> `==` is not supported between `type[@_]` and `type[MyList]`

This was in response to code like:

```python
assert castfit.get_origin_type(MyList) == MyList
```

Good catch. That `==` should `is`.

> Can't apply arguments to non-class, got `LegacyImplicitTypeAlias[TypeForm, type[type[TypeVar(T, invariant)] | Any]]` \[bad-specialization\]

Not sure what this means or how to handle it.

> Argument `Forall[T, (value: Any, kind: Unknown) -> bool]` is not assignable to parameter with type `(Any, Unknown) -> bool` \[bad-argument-type\]

Imagine my confusion when I'm trying to figure out why this is not assignable. Must be that `Unknown` can't be assigned to `Unknown`. I might try this again in the future, but the error messages could definitely use some work.
