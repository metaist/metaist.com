---
created: "2025-12-24T05:17:17Z"
updated: "2025-12-24T05:17:17Z"
title: "baton: emulating Astral's CLI approach"
tags:
  - astral
  - uv
  - ruff
  - python
  - cosmofy
  - Charlie Marsh
  - William McGuan
series: cosmofy
description: "How much of the Astral CLI theme can I emulate in Python?"
---

_Previously_: [pythonoid](/blog/2024/09/pythonoid.html)

Imitation is the highest form of flattery which is why as part of the [`cosmofy 0.2.0`](/blog/2025/12/cosmofy-0.2.0.html) release, I decided to change everything about how the CLI behaved to make it work more like the way the [tools from Astral](https://astral.sh/) work.

I have a long-term plan for Astral to take over making Cosmopolitan Python apps. It's a long shot, but if they do, it'll be a huge win for cross-platform compatible executables. I also saw [this popular issue](https://github.com/astral-sh/uv/issues/5802) that there should be a `uv bundle` command that bundles everything up.

To make it easier to adopt, I decided to make the interface follow Astral's style in three important ways:

1. **Subcommand structure**: It's gotta be `cosmofy bundle` and `cosmofy self update`
2. **Colored output**: Gotta auto-detect that stuff. Luckily, I had fun with [brush](https://github.com/metaist/brush) years ago, so I know about terminal color codes.
3. **Global flags**: Some of those flags gotta be global.
4. **Smart ENV defaults**: smart defaults + pulling from environment variables to override.

Now I didn't start out wanting to build my own argument parser (really, I promise I didn't!). I tried going the `argparse` route (I even tried my own `attrbox / docopt` solution), but I had a few constraints:

1. I really don't want 3rd party dependencies (even my own). `cosmofy` needs to stay tight and small.
2. I want argument parsing to go until it hits the subcommand and then delegate the rest of the args to the subcommand parser.
3. I want to pass global options from parent to child sub-parser as needed.

Together these pushed for a [dedicated parser](https://github.com/metaist/cosmofy/blob/main/src/cosmofy/baton.py). This lets me write things like:

```python
usage = f"""\
Print contents of a file within a Cosmopolitan bundle.

Usage: cosmofy fs cat <BUNDLE> <FILE>... [OPTIONS]

Arguments:
{common_args}
  <FILE>...                 one or more file patterns to show

  tip: Use `--` to separate options from filenames that start with `-`
  Example: cosmofy fs cat bundle.zip -- -weird-filename.txt

Options:
  -p, --prompt              prompt for a decryption password

{global_options}
"""


@dataclass
class Args(CommonArgs):
    __doc__ = usage
    file: list[str] = arg(list, positional=True, required=True)
    prompt: bool = arg(False, short="-p")

...

def run(args: Args) -> int:
  ...

cmd = Command("cosmofy.fs.cat", Args, run)
if __name__ == "__main__":
    sys.exit(cmd.main())
```

For the colored output, I took inspiration from William McGuan's [rich](https://github.com/Textualize/rich) which uses tag-like indicators to style text.

[Mine is much worse and minimal](https://github.com/metaist/cosmofy/blob/796abd21bc0679e028f15d3e6167f547917dbc5c/src/cosmofy/baton.py#L424), but it gets the job done for the bits of color I need.
