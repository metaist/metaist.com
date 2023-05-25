---
draft: true
created: ""
updated: ""
title: "Fun with Python Mapping"
tags: ["note", "python", "mypy"]
---

[`mypy`](https://mypy-lang.org/) is a static type-checking tool. It's like a very pedantic linter and I have a personal goal to try and satisfy it's `--strict` mode demands.

It took me a while to get the hang of TypeScript types, so I thought I kinda got all the practical type theory I'd need, but alas I didn't. Turns out python's types are just different.

## Unsupported target for indexed assignment

Usually when `mypy` complains about something, I basically know what the problem is and how to fix it. Here's a minimal example of my first real head-scratcher:

```python
from typing import Any, Mapping

box: Mapping[str, Any]
box["this"] = "fail"
# => error: Unsupported target for indexed assignment
# ("Mapping[str, Any]")  [index]
```

Why doesn't this work? Well, it turns out that [`Mapping` is intended to represent a **read-only** structure](https://stackoverflow.com/a/60457779). _That's_ why there's a `MutableMapping` (I always wondered). Ok, so I switched to `MutableMapping`. Here's another minimal example of the next problem:

```python
from typing import Any, MutableMapping

def test(cls: MutableMapping[Any, Any]) -> None:
    cls()

# => error: "MutableMapping[Any, Any]" not
# callable  [operator]
```

Why not!? Because I didn't specify that I want the _class_ of this type, not a concrete instance of this type.

```python
from typing import Any, MutableMapping, Type

def test(cls: Type[MutableMapping[Any, Any]]) -> None:
    cls()
```

This works! Ok, on to the next problem:

```python
from typing import Any, Mapping, SupportsIndex, Union

general: Mapping[Union[str, SupportsIndex, slice], Any]
specific: Mapping[str, Any] = {}

general = specific
# => error: Incompatible types in assignment
# (expression has type "Mapping[str, Any]",
# variable has type "Mapping[Union[str,
# SupportsIndex, slice], Any]")  [assignment]
```

As an aside, why am I using `SupportsIndex` instead of `int`? Because I'm working on a version of a `Mapping` that supports the same signature as `list.__getitem__` and that's what it expects for it's index.

So why is `str` not compatible with `Union[str, ...]`? Maybe because I don't have a `Union` for the `specific` type?

```python
general: Mapping[Union[str, SupportsIndex, slice], Any]
specific: Mapping[Union[str, int], Any] = {}
general = specific
# => error: Incompatible types in assignment
# (expression has type "Mapping[Union[str, int], Any]",
# variable has type "Mapping[Union[str,
# SupportsIndex, slice], Any]")  [assignment]
```

Nope. Turns out [`Mapping` is "invariant in its key type"](https://stackoverflow.com/a/64484841). Reading [the relevant mypy docs](https://mypy.readthedocs.io/en/latest/common_issues.html#invariance-vs-covariance) and the [long python github thread](https://github.com/python/typing/pull/273) there is some real complexity in trying to use python's type system to describe how `Mapping` should work.

I don't _totally_ understand the discussion, but I'm guessing this means something like "the type of the key cannot change" and so this isn't going to be remedied soon. Therefore, I'm going to have to go back to my trusted solution:

```python
general: Mapping[Any, Any]
specific: Mapping[Union[str, int], Any] = {}
general = specific
```

This works.

<img src="{{thumbnail}}" style="max-width: 100%;" />
