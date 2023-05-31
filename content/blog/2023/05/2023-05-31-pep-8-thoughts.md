---
created: "2023-05-31T14:54:03Z"
updated: "2023-05-31T14:54:03Z"
title: PEP 8 Thoughts (2023)
tags: ["LTS", "python", "style"]
---

It's been a little while since I read [PEP 8 – Style Guide for Python Code](https://peps.python.org/pep-0008/), but I was [recently prompted to read it by ChatGPT](https://github.com/metaist/attrbox/issues/7#issuecomment-1570237330) which made me realize I don't agree with all of the guidance.

## Formatting

I'm not even going to read this section carefully, because I use [`black`](https://black.readthedocs.io/en/stable/the_black_code_style/current_style.html), so I don't have to argue about formatting. I don't agree with all of it's opinions (e.g., I used to prefer single quotes to double quotes because they take up less visual space), but I love not having to think about them.

## Imports

[PEP 8 - Imports](https://peps.python.org/pep-0008/#imports):

> It’s okay to say this though:
>
> ```python
> # Correct:
> from subprocess import Popen, PIPE
> ```

Two weeks ago, I started writing every import on its own line, even when importing from the same package. During prototyping I'm constantly importing lots of things from `typing` as I figure out which types to use to pass around to functions. But then `mypy` complains when there are unused imports. It's much easier to comment / uncomment lines than to deal with a comma-separated list.

> Imports are always put at the top of the file, just after any module comments and docstrings, and before module globals and constants.

Except for those times when you need to avoid circular imports. I used to encounter this all the time, but somehow it's become less of an issue more recently.

> Imports should be grouped in the following order:
>
> 1. Standard library imports.
> 2. Related third party imports.
> 3. Local application/library specific imports.

I'm a little obsessive about this and even mark these sections `# native`, `# lib`, and `# pkg`.

## Module Level Dunder Names

[PEP 8 - Module Level Dunder Names](https://peps.python.org/pep-0008/#module-level-dunder-names):

> Module level “dunders” (i.e. names with two leading and two trailing underscores) such as **all**, **author**, **version**, etc. should be placed after the module docstring but before any import statements except from **future** imports. Python mandates that future-imports must appear in the module before any other code except docstrings: [...]

Strongly disagree for two reasons:

1. `__future__` imports have to come first anyway, so do all your imports like usual and then declare your constants like usual. These should just be constants you declare earlier than others.

2. In a package's `__init__.py` you often import a bunch of things and then enumerate them in your `__all__` to "export" them out to the world. If you don't `ruff` will complain that you have an unused import. Therefore, it logically makes more sense to declare all your imports and _then_ use them, like you normally do.

I don't see any advantage to putting these constants before the imports.

## Lambdas

[PEP 8 - Programming Recommendations](https://peps.python.org/pep-0008/#programming-recommendations):

> Always use a def statement instead of an assignment statement that binds a lambda expression directly to an identifier:
>
> ```python
> # Correct:
> def f(x): return 2*x
> # Wrong:
> f = lambda x: 2*x
> ```
>
> The first form means that the name of the resulting function object is specifically ‘f’ instead of the generic ‘<lambda>’. This is more useful for tracebacks and string representations in general. The use of the assignment statement eliminates the sole benefit a lambda expression can offer over an explicit def statement (i.e. that it can be embedded inside a larger expression)

I get it, but I'm annoyed by this. I can't quite put my finger on why. Maybe it's something about `lambda` being almost useless in python (unfortunately) and this is just another place where it's use is removed.

## Checking Prefixes and Suffixes

[PEP 8 - Programming Recommendations](https://peps.python.org/pep-0008/#programming-recommendations):

> Use ''.startswith() and ''.endswith() instead of string slicing to check for prefixes or suffixes.
> startswith() and endswith() are cleaner and less error prone:
>
> ```python
> # Correct:
> if foo.startswith('bar'):
> # Wrong:
> if foo[:3] == 'bar':
> ```

Even for a single character? Hm. Not sure I agree. Let's try out some recent use cases from last night.

[Removing braces](https://github.com/metaist/attrbox/blob/16cd8732bc62739e347bf9b7c8ac1843ff098aa3/src/attrbox/env.py#L98):

```python
# current
if len(name) > 2 and name[0] == "{" and name[-1] == "}":
    name = name[1:-1]

# proposed
if name.startswith("{") and name.endswith("}"):
    name = name[1:-1]
```

That might work, although I think I'd still want to check `len` to make sure I didn't end up with an empty `name`.

[Removing single quotes](https://github.com/metaist/attrbox/blob/16cd8732bc62739e347bf9b7c8ac1843ff098aa3/src/attrbox/env.py#L186):

```python
# current
if len(key) >= 2 and key[0] == key[-1] == "'":
    key = key[1:-1]  # unquote key

# proposed
if key.startswith("'") and key.endswith("'"):
    key = key[1:-1]  # unquote key
```

Not terrible. I keep thinking the function calls are expensive, but they're probably not.

[Removing single or double quotes](https://github.com/metaist/attrbox/blob/16cd8732bc62739e347bf9b7c8ac1843ff098aa3/src/attrbox/env.py#L192):

```python
# current
if (
    len(value) >= 2
    and value[0] in "\"'"
    and value[-1] in "\"'"
    and value[0] == value[-1]
):
    value = value[1:-1]  # unquote value

# proposed
if (value.startswith("'") and value.endswith("'")) or (
    value.startswith('"') and value.endswith('"')
):
    value = value[1:-1]  # unquote value
```

That's actually pretty readable. I would have to add the `len` check to make sure a single `"` (which starts and ends with `"`) doesn't get counted.

Ok. I guess I agree with this guidance.

Nothing else in PEP 8 stood out to me as something I had strong opinions on (for now).
