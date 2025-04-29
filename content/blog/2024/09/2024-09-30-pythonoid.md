---
created: "2024-09-30T22:45:06Z"
updated: "2024-09-30T22:45:06Z"
title: "pythonoid: Emulating the Python CLI in Python"
tags: ["python", "cosmofy"]
series: "cosmofy"
description: "How much of the Python CLI can you emulate in Python?"
---

When I was a kid, I was fascinated with tools that could build themselves (hence, "Metaist"). I once spent an entire week trying to make the QBasic interface (blue screen, menu bars) _within_ QBasic. Like you'd press `F5` to run the program and you'd end up in a blank QBasic editor screen. I learned a lot about drawing on the screen and capturing key presses.

Recently, while I was adding self-updating to [`cosmofy`](/blog/2024/09/cosmofy-0.1.0.html), I needed to intercept command-line arguments destined for python. The idea is that if you call the Cosmopolitan app with `--self-update`, it will check for updates (e.g., on GitHub) and replace itself with the latest version. Otherwise, it should continue as normal.

But how much of the [Python Command-Line Interface](https://docs.python.org/3/using/cmdline.html) can you implement in Python? Turns out, quite a bit.

Let's take a look at the usage:

```bash
python [-bBdEhiIOPqRsSuvVWx?] [-c command | -m module-name | script | - ] [args]
```

- `-h`: just print the subset of the `--help` message that we implement (since it's not the full thing)
- `-i`: go into the REPL after `-c`, `-m`, or `<script>` using [`code.interact`](https://docs.python.org/3/library/code.html#code.interact)
- `-q`: don't print headers in the REPL
- `-V`: print `sys.version` information (also handle `-VV` for printing a little bit more version info)
- `-c`: run a command using `exec`
- `-m`: run a module using [`runpy.run_module`](https://docs.python.org/3/library/runpy.html#runpy.run_module)
- `<script>`: run a script using [`runpy.run_path`](https://docs.python.org/3/library/runpy.html#runpy.run_path)
- `-`: read from `stdin`

The next tricky bit is emulating `locals` to make sure that they look the same as they do with native python:

```python
    if isinstance(__builtins__, dict):
        loader = __builtins__["__loader__"]
    else:  # pragma: no cover
        # During testing, __builtins__ is a dict.
        loader = __builtins__.__loader__

    local: Dict[str, object] = {
        "__name__": "__main__",
        "__doc__": None,
        "__package__": None,
        "__loader__": loader,
        "__spec__": None,
        "__annotations__": {},
        "__builtins__": __builtins__,
    }
```

We also manipulate exceptions to make them look the same as they do with the REPL:

```python
    sys.argv = args.argv
    code = 0
    try:
        if args.c:  # execute in the context of the locals
            args.q = True
            exec(args.c, local, local)
        elif args.m:
            args.q = True
            runpy.run_module(args.m, local, "__main__", alter_sys=True)
        elif args.script:
            args.q = True
            local["__loader__"] = SourceFileLoader
            runpy.run_path(args.script, local, "__main__")
    except Exception as e:
        code = 1
        # NOTE: We skip the calling frame to emulate the CLI better.
        tb = sys.exc_info()[2]
        tb_next = tb.tb_next if tb else tb
        print("".join(traceback.format_exception(e.__class__, e, tb_next)), end="")
```

Putting it all together, you get [`pythonoid.py`](https://github.com/metaist/cosmofy/blob/4961e2033953960fa8d67ae814c10125d12bfc75/src/cosmofy/pythonoid.py#L78).

`pythonoid` also has some nice functions for compiling python into a `bytearray` that `cosmofy` can use to write directly into the bundle.
