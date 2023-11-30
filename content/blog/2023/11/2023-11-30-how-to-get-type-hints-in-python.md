---
published: "2023-11-30T13:52:23Z"
updated: "2023-11-30T13:52:23Z"
title: "Access type hints in python"
tags: ["python", "freshlinks"]
---

While working on [freshlinks], I got frustrated with not having my arguments typed correctly when coming from `docopt`. I know there's [`type-docopt`](https://pypi.org/project/type-docopt/), but that introduces a new syntax and I haven't fully evaluated that library yet.

[freshlinks]: https://github.com/metaist/freshlinks

In the meantime, I wanted to see if I could implement a minimal approach, but first I need to be able to get the type hints from a class definition.

```python
from dataclasses import dataclass
from pathlib import Path
from typing import get_type_hints
from typing import Optional

@dataclass
class Args:
  """Reticulate the splines from the command-line.

  Usage: ./reticulate.py
    [--help | --version]
    [--debug] [--path PATH] [-n INT]
  """

  help: bool = False
  """`-h, --help`   show the help message and exit"""

  version: bool = False
  """`--version`    show the program version and exit"""

  debug: bool = False
  """`--debug`      show debug messages"""

  path: Optional[Path] = None
  """`--path PATH`  path to splines"""

  n: int = 42
  """`-n INT`       number of splines to reticulate"""

print(get_type_hints(Args))
# {
#   'help': <class 'bool'>,
#   'version': <class 'bool'>,
#   'debug': <class 'bool'>,
#   'path': typing.Union[pathlib.Path, NoneType],
#   'n': <class 'int'>
# }
```

I thought it might be easy, but I didn't think it would be _this_ easy.

Now I just need to think about how to handle those `Optional` vs `Union` types.
