---
created: "2025-04-29T17:48:24Z"
updated: "2025-04-29T17:48:24Z"
title: "cattrs I: un/structuring speed"
tags: ["link", "cattrs", "castfit"]
description: "Definitely faster and maybe better overall than castfit."
link: https://threeofwands.com/why-cattrs-is-so-fast/
---

[**{{title}}**]({{link}})

During the [code review for `castfit`][1], Gemini pointed me at [`attrs`] and [`cattrs`]. Many of the features of the `attrs` became `dataclasses` in the standard python library while the features of the `cattrs` look _very_ similar to my own `castfit` library.

I started reading up on `cattrs` and I came across the article above which explains the three phases of optimization that `cattrs` went through. The first phase roughly corresponds to how `castfit` does conversions today. It also highlights the same problems I anticipate if `castfit` were to ever be used in a production environment.

The second (generated code) and third phases (optimized bytecode) reflect some very interesting optimizations. I'm glad that they kept the initial phase code around for situations where you don't have time up front (e.g., at CLI start up).

My simple test didn't work:

```bash
uv run --with cattrs python
```

```python
>>> import cattrs
>>> class Cat:
...     name: str
...     age: int
...
>>> cattrs.structure({"name": "Garfield", "age": 45}, Cat)
Traceback (most recent call last):
  File "<python-input-2>", line 1, in <module>
    cattrs.structure({"name": "Garfield", "age": 45}, Cat)
    ~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File ".../lib/python3.13/site-packages/cattrs/converters.py", line 558, in structure
    return self._structure_func.dispatch(cl)(obj, cl)
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File ".../lib/python3.13/site-packages/cattrs/fns.py", line 22, in raise_error
    raise StructureHandlerNotFoundError(msg, type_=cl)
cattrs.errors.StructureHandlerNotFoundError: Unsupported type: <class '__main__.Cat'>. Register a structure hook for it.
```

It turns out you need to use `attrs` or `dataclasses` to make this into an object that can be converted into:

```python
>>> from dataclasses import dataclass
>>> @dataclass
... class Cat:
...     name: str
...     age: int
...
>>> cattrs.structure({"name": "Garfield", "age": 45}, Cat)
Cat(name='Garfield', age=45)
```

`castfit` can handle the dataclass approach too, but for the undecorated version it just tries constructing an empty object and setting a bunch of attributes on it. Not sure if this is a reasonable assumption (probably isn't), but it reduces the number of required imports.

Overall, though, I'm pretty impressed by `cattrs`.

[1]: /blog/2025/04/2025-04-29-castfit-code-review.html
[`attrs`]: https://www.attrs.org/en/stable/
[`cattrs`]: https://catt.rs/en/stable/
