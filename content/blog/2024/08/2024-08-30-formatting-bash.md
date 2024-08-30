---
created: "2024-08-30T20:35:29Z"
updated: "2024-08-30T20:35:29Z"
title: "Formatting Bash Commands"
tags: ["bash", "ds"]
description: "A 90% solution for the most common cases."
---

While I was working on the [latest release of `ds`](/blog/2024/08/ds-1.3.0.html), I thought it would be nice to format the command that is about to be run. This is particularly true in files like `package.json` that don't support multi-line strings. And even those formats that do (e.g., `.toml`), escaping the newline also strips leading whitespace of the following line which makes commands hard to format (or you need to escape the slash).

Here are three examples of actual commands:

**Example 1**: Command with lots of options:

```bash
rm -rf docs; \
mkdir -p docs; \
pdoc \
  --html \
  --output-dir docs \
  --config sort_identifiers=False \
  --config show_inherited_members=True \
  --force src/$(basename $(pwd)); \
mv docs/**/* docs/; \
touch docs/.nojekyll
```

**Example 2**: Lots of short commands in a row:

```bash
git commit -am "release: $1";\
git tag $1;\
git push;\
git push --tags;\
git checkout main;\
git merge --no-ff --no-edit prod;\
git push
```

**Example 3**: Chain of `pnpm` commands:

```bash
npm run lint:spell && npm run lint:tsc && npm run lint:format
```

So my initial though was to split on `;`, remove line continuations, and wrap the command as we went.

```python
def wrap_cmd(cmd: str, width: int = 79, indent: int = 2, split_on: str = ";"):
    """Wrap a command-line command."""
    command_continue = " \\\n"

    lines = []
    cmd = cmd.strip().replace("\\\n", "\n")
    commands = [c.strip().split(" ") for c in cmd.split(split_on)]
    last_idx = len(commands) - 1
    for idx, command in enumerate(commands):
        new_cmd = []
        line = ""
        for item in command:
            item = item.strip()
            if not item:
                continue
            check = f"{line} {item}" if line else item
            if len(check) <= width:
                line = check
                continue
            new_cmd.append(line)
            line = item

        if line:
            new_cmd.append(line)

        if new_cmd:
            lines.append(
                f"{command_continue}{' ' * indent}".join(new_cmd)
                + (split_on if idx != last_idx else "")
            )
    return command_continue.join(lines).replace("\n", f"\n{' ' * indent}")
```

The problem is that example 3 doesn't have any semicolons. So then I worked on a function where we could specify which tokens prefer breaks (this is some code I had in a scratch pad).

```python
NO_CONTINUE = ";; && |& || ; & |".split()
PREFER_BREAK = "; &&".split()
CONTINUE_LINE = "\\\n"


def peek_end(haystack: str, *needles: str) -> str:
    for needle in needles:
        if haystack.endswith(needle):
            return needle
    return ""


width = 78
line = ""
result = []
cmd = cmd3.replace(CONTINUE_LINE, "").strip()
for item in cmd.split(" "):
    item = item.strip()
    if not item:
        continue
    check = f"{line} {item}" if line else item
    if len(check) <= width:
        line = check
        if peek_end(line, *PREFER_BREAK):
            result.extend([line, "\n"])
            line = ""
        continue
    # need new line
    result.append(line)
    line = item
    if peek_end(line, *NO_CONTINUE):
        result.append("\n")
    else:
        result.append(f" {CONTINUE_LINE}")
    if not peek_end(line, *PREFER_BREAK):  # needs indent
        line = f"  {item}"

if line:
    result.append(line)

print("".join(result))
```

But then I had problems with indentation. So here's the solution I'm currently using. It's far from perfect, but it basically works for most cases I have so far:

```python
import re
from os import get_terminal_size

SHELL_BREAK = "; &&".split()
"""Prefer line breaks after these."""

SHELL_CONTINUE = "\\\n"
"""Line continuation."""

SHELL_TERMINATORS = ";; && |& || ; & |".split()
"""No line continuation needed after these."""

RE_SPLIT = re.compile(
    r"""(
    (?<!\\)             # not preceded by backslash
    (?:
        (?:'[^']*')     # single quoted
        |(?:\"[^\"]*\") # double quoted
        |[\s;&]+        # one or more space, semicolon or ampersand
    ))""",
    flags=re.VERBOSE,
)
"""Regex for splitting commands."""


DEFAULT_WIDTH = 80
"""Default width for wrapping commands."""

try:
    DEFAULT_WIDTH = min(100, max(80, get_terminal_size().columns - 2))
except OSError:
    DEFAULT_WIDTH = 80

def peek_end(haystack: str, *needles: str) -> str:
    """Return the first `needle` that ends `haystack`.

    >>> peek_end("abc", "a", "b", "c")
    'c'
    >>> peek_end("abc", "x")
    ''
    """
    for needle in needles:
        if haystack.endswith(needle):
            return needle
    return ""

def wrap_cmd(cmd: str, width: int = DEFAULT_WIDTH) -> str:
    """Return a nicely wrapped command."""
    result = []
    line = ""
    space = " " * 2
    for item in RE_SPLIT.split(cmd.replace(SHELL_CONTINUE, "").strip()):
        item = item.strip()
        if not item:
            continue

        check = f"{line} {item}" if line else item
        if item in [";", ";;"]:
            check = f"{line}{item}"

        if len(check) <= width - 4:
            line = check
            # Coverage incorrectly thinks this branch is not covered.
            # See: nedbatchelder.com/blog/202406/coverage_at_a_crossroads.html
            if peek_end(line, *SHELL_BREAK):  # pragma: no cover
                result.extend([line, "\n"])
                line = ""
            continue

        # How should we terminate this line?
        if peek_end(line, *SHELL_TERMINATORS):  # no continuation
            result.append(f"{line}\n")
        else:
            result.append(f"{line} {SHELL_CONTINUE}")

        # Indent next line?
        if space and not peek_end(line, *SHELL_TERMINATORS):
            line = f"{space}{item}"
        else:
            line = item  # next line

    if line:  # add last line
        result.append(line)

    return "".join(result).replace("\n", f"\n{space}").strip()
```
