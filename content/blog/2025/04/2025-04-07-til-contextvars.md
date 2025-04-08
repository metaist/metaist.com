---
created: "2025-04-08T00:31:42Z"
updated: "2025-04-08T13:19:30Z"
title: "TIL: contextvars in python"
tags: ["TIL", "python", "contextvars"]
description: "What they are and how to use them."
---

While I was working on my third attempt of a python version of [`idempotent-bash`](https://github.com/metaist/idempotent-bash), ChatGPT suggested I use [`contextvars`](https://docs.python.org/3/library/contextvars.html) which has apparently been part of the standard library since python 3.7. This is different from [`contextlib`](https://docs.python.org/3/library/contextlib.html) which I know and like.

Let's start with a simple (imprecise) definition: A `ContextVar` is like a global variable except that it can be reset to earlier values.

Why would you want this? The situation where I found it helpful was to avoid having to track and pass the same variable into every function I was writing.

```python
from __future__ import annotations
from dataclasses import dataclass
from contextvars import ContextVar


_current: ContextVar[IdemPy | None] = ContextVar("_current", default=None)

@dataclass
class IdemPy:

    # parameters for how functions should behave
    dry: bool = False
    force: bool = False
    keep_running: bool = False
    show_progress: bool = True

    def __enter__(self) -> IdemPy:
        self._token = _current.set(self)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        _current.reset(self._token)

    @classmethod
    def get(cls, default: IdemPy | None = None) -> IdemPy:
        current = _current.get() or default
        if not current:
          current = IdemPy()
          _current.set(current)
        return current

# elsewhere
def my_function() -> None:
    idempy = IdemPy.get():
    ... # continue with the correct context


my_function() # creates a default IdemPy context
with IdemPy():
    my_function() # similar to above

with IdemPy(force=True):
    my_function() # slightly different IdemPy context
```

There are two alternatives that I have tried in the past:

1. Add `idempy` as an argument to `my_function`. It works at the cost of having to pass that argument around into every function. And for a class where you almost always want the default version, that feels very expensive.

2. Wrap `my_function` in a class which, when constructed, takes a class of `IdemPy`. This is also very heavy and reminds me most of Java. Let construct the builder which will instantiate the initiator.... No.

Most of the time I just want to call `my_function` and have it do the right thing. Occasionally, I want to more explicitly set the context using `with IdemPy(...)` which overrides what `IdemPy.get()` returns by changing the `ContextVar`. I can even nest `with IdemPy():` calls and it will do the right thing.

While all the advice about global variables is reasonable, this is one of those cases where I actually think python's `with` statement works incredibly well.

**Update (2025-04-08)**: Shalev NessAiver asks whether `ContextVar` acts like a stack and whether you can `pop` and `push` to the same token's value.

Nope. First, unlike a stack you reset the values in a different order than you set them.

```python
from contextvars import ContextVar
v = ContextVar('v', default=0)
token1 = v.set(10)
token2 = v.set(20)
token3 = v.set(30)

v.reset(token2)
assert v.get() == 10

v.reset(token3)
assert v.get() == 20

v.reset(token1)
assert v.get() == 0
```

Second, you'll get an error if you try to reset the same token twice.

```python
from contextvars import ContextVar
v = ContextVar('v', default=0)
token = v.set(10)
v.reset(token)
assert v.get() == 0

v.reset(token) # raises RuntimeError: <Token ...> has already been used once
```
