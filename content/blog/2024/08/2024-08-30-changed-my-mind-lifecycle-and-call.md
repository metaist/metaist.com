---
created: "2024-08-30T20:40:06Z"
updated: "2024-08-30T20:40:06Z"
title: "Changed My Mind: Lifecycle Events and call-style Tasks"
tags: ["ds"]
description: "I still don't like 'em, so I'll make it opt-in."
---

This is another post about building the [latest release of `ds`](/blog/2024/08/ds-1.3.0.html). There were two features that many task runners support that I specifically had chosen to **not support**: lifecycle events and `call`-style tasks. However, the latest release gave me a chance to try two different approaches to supporting these features.

## Lifecycle Events

Many task runners have the concept of pre- and post-task events. Like if you run `pnpm publish` it will also call `pnpm prepublish` before the task runs and `pnpm postpublish` afterwards.

The main reason I don't like this feature is that it obscures the relationship between tasks. In `ds`, you can be more explicit about the relationship:

```toml
[tool.ds.scripts]
publish = ['prepublish', 'publish-magic-happens-here', 'postpublish']
```

So in previous version of `ds`, I simply said you have to be more explicit. However, I've been watching how `uv` has been working on experimental features and how they support **explicit opt-in** for features that they don't support philosophically. For example, they added `--system` as a way of finding the system-level python which goes against their general philosophy of detecting and activating a virtual environment.

So I decided to add two experimental options `--pre` and `--post` to let you control whether those tasks run. `pnpm` has a very complex mechanism for selecting which pre-/post-tasks run, but I'll start simple: either you get them all or none.

I still don't do any language-specific lifecycle events (e.g., `ds install` doesn't call some magical list of _other_ tasks).

## `call`-style tasks

Which brings me to another file & language-specific feature: `call` tasks. These usually let you load and invoke a function in an installed package. For example, in `pdm` you can write:

```toml
[tool.pdm.scripts]
foobar = {call = "foo_package.bar_module:main"}
```

Before I created [file-specific parsers](https://github.com/metaist/ds/issues/77), there were two reasons I didn't support these kinds of tasks.

First, **it obscures what actually gets called**. That example above would be converted into:

```bash
python -c 'import sys; import foo_package.bar_module as _1; sys.exit(_1.main())
```

And second, how could I know ahead of time which language was being invoked? After all, `composer.json` has a similar style for invoking `php` methods.

Switching to file-specific parsers solved this problem. If you use `pyproject.toml`, you must want `python` and in `composer.json` it's `php`. And if you use a generic file like `ds.toml`, then I'll throw a `SyntaxError` because it's unclear what you're trying to do.
