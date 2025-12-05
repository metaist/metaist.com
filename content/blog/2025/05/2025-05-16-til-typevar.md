---
created: "2025-05-16T16:36:32Z"
updated: "2025-05-16T16:36:32Z"
title: "TIL: invariant, covariant, and contravariant type variables"
description: "I avoided learning this for so long."
tags:
  - TIL
  - python
  - typed
  - castfit
series: TIL
---

While working on {{ "`castfit`" | tagify }}, I ended up going down a rabbit hole learning about what makes something a subtype of something else. I vaguely knew the terms "invariant", "covariant", and "contravariant", but have very carefully avoided ever learning what they meant.

If you look at the Wikipedia entry on [Covariance and contravariance (computer science)](<https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science)>) you see explanations like:

> Suppose `A` and `B` are types, and `I<U>` denotes application of a [type constructor](https://en.wikipedia.org/wiki/Type_constructor "Type constructor") `I` with type argument `U`. Within the [type system](https://en.wikipedia.org/wiki/Type_system "Type system") of a programming language, a [typing rule](https://en.wikipedia.org/wiki/Typing_rule "Typing rule") for a type constructor `I` is:
>
> - _covariant_ if it preserves the [ordering of types (≤)](https://en.wikipedia.org/wiki/Subtyping "Subtyping"), which orders types from more specific to more generic: If `A ≤ B`, then `I<A> ≤ I<B>`;
> - _contravariant_ if it reverses this ordering: If `A ≤ B`, then `I<B> ≤ I<A>`;
> - _bivariant_ if both of these apply (i.e., if `A ≤ B`, then `I<A> ≡ I<B>`);[\[1\]](<https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science)#cite_note-1>)
> - _variant_ if covariant, contravariant or bivariant;
> - _invariant_ or _nonvariant_ if not variant.

Uh, super helpful. The introductory description is a lot better than it used to be, but talking it over with ChatGPT was actually the best way for me to understand what these terms mean.

## Simpler Definitions

Suppose we have a type hierarchy like:

```text
Labrador → Dog → Animal
Siamese  → Cat → Animal
```

The arrow indicates an "is a" relationship moving from more specific (narrow) to more general (broad): a Labrador is a type of Dog; a Dog is a type of Animal, etc.

The question of co/contra/invariance comes up when you want to know: **Can I substitute one type for another?**

It turns out that this depends on many things, but the situations are classified as:

- **Invariant**: It must be this exact type. No broader or narrower substitutions allowed.
- **Covariant**: The same or broader (more general) type is acceptable.
- **Contravariant**: The same or narrower (more specific) type is acceptable.
- **Bivariant** (haven't seen this in Python): The same, broader, or narrower type is acceptable.

This mostly comes into play when you start looking at containers of objects like `list`, `set`, `tuple`, `dict`, etc. Also Python has several exceptions to its own rules that are not immediately obvious.

## General Python Rules

1. **The contents of _mutable_ containers are _invariant_**. For example, if a function takes `list[Animal]`, you cannot pass `list[Dog]` because that function might add a `Cat` (which is an `Animal`) there by violating the type safety of `list[Dog]` that was passed in.

An exception to this rule in Python is when "implicit conversion" occurs. A function that takes `list[int]` is ok to take `list[bool]` because there is an implicit conversion that happens. It seems that the [numeric tower](https://peps.python.org/pep-0484/#the-numeric-tower) of `bool → int → float → complex` all happens implicitly. There are a few other implicit conversions that I'm still learning about.

2. **The contents of _immutable_ containers (or read-only situations) are _covariant_**. A function that takes `Sequence[Animal]` is ok to take `Sequence[Dog]` because `Sequence` is read-only (and `Animal` is broader than `Dog`).

Not really an exception, but fun fact: _fixed-length_ `tuple` are **covariant**, while _variable-length_ tuples are **invariant**.

[PEP 483] has a nice example of **contravariant** types: `Callable`. While it is **covariant** in its return type (`Callable[[], Dog]` is a subtype of `Callable[[], Animal]`), it is **contravariant** in its arguments (`Callable[[Animal], None]` **is a subtype** of `Callable[[Dog], None]`).

This leads to a good rule of thumb:

> The example with `Callable` shows how to make more precise type annotations for functions: choose the most general type for every argument, and the most specific type for the return value.

It looks like [PEP 695] made it into Python 3.12, so maybe reasoning about this will get easier in the future especially because it [automatically infers the variance](https://peps.python.org/pep-0695/#variance-inference) of the type variables.

[PEP 483]: https://peps.python.org/pep-0483/
[PEP 695]: https://peps.python.org/pep-0695/
