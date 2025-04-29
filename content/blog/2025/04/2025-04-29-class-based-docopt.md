---
created: "2025-04-29T16:23:29Z"
updated: "2025-04-29T16:23:29Z"
title: "Class-based docopt usage strings"
tags: ["python", "typed", "docopt", "attrbox", "castfit"]
series: "typed"
description: "I keep wanting to make this, but now I'm not sure it's a good idea."
---

_Previously_: [Access type hints in python][prev-1], [castfit 0.1.0][prev-2]

[`attrbox`][attrbox] is my little library for loading configuration files, reading environment variables, and parsing command-line arguments. I reach for it every time I make a little CLI or throwaway script so that I can write out the usage and quickly get everything up and running.

One [problem with using a `docopt`-based approach][prev-1] is that the result isn't typed properly. I created [`castfit`][castfit] exactly for this purpose: just define the class with the correct types for the fields and a usage string and you're good to go.

But there are a few annoyances:

1. You have to import two things (`attrbox` and `castfit`).
2. Now you have to synchronize the usage string with the class members (which are far away).
3. If you want to document the members, you're repeating yourself three times (usage string, member, and member docstring).

I keep wanting to move the documentation closer to the class members and then dynamically build up the usage string. But this introduces new problems:

1. You need to use [`ast`][ast] to find the floating string expressions that are near the class members. So this won't work in, e.g., the REPL.
2. You need to format them some way. There's a tension between how you document a class member normally and how you do it when it's part of the `docopt` usage string.

And now your usage string isn't as clean as it was when you started.

I have a working version that I'll push out soon. We'll see if I ever reach for it.

[attrbox]: https://github.com/metaist/attrbox
[castfit]: https://github.com/metaist/castfit
[prev-1]: /blog/2023/11/how-to-get-type-hints-in-python.html
[prev-2]: /blog/2023/12/castfit-0.1.0.html
[ast]: https://docs.python.org/3/library/ast.html
