---
created: "2024-09-01T02:16:07Z"
updated: "2024-09-01T02:16:07Z"
title: "How to package a python project with Cosmopolitan"
tags: ["python", "cosmo", "ds", "Simon Willison", "Shalev NessAiver"]
description: "Knowledge is half the battle."
---

[Cosmopolitan Libc](https://github.com/jart/cosmopolitan) is a way of building [Actual Portable Executables](https://justine.lol/ape.html) which run, unmodified, on Windows, Linux, and macOS and on multiple architectures.

I first heard about Cosmopolitan from [Simon Willison](https://simonwillison.net/tags/cosmopolitan/) in the context of [llamafile](https://github.com/Mozilla-Ocho/llamafile), but it was [Shalev NessAiver](https://github.com/Pugio) who showed me how I could package up my python project into a single executable that can run everywhere.

There are three main things you need to do:

1. Compile the `.py` files to `.pyc`.
2. Add them to the `python` executable zip file.
3. Add a special `.args` file that runs your program instead of the python REPL.

I'll illustrate how this works using `ds` which I used to build a Cosmopolitan version of itself.

```toml
# inside your pyproject.toml
[tool.ds.scripts]
_.env.PKG = "ds"
_.env.DIR_SITE = "dist/cosmo/Lib/site-packages"

cosmo-clean = "rm -rf $DIR_SITE || true"

cosmo-setup = """
  mkdir -p $DIR_SITE;
  cp -r src/$PKG $DIR_SITE;
  printf -- "-m\\n$PKG\\n..." > dist/cosmo/.args;
"""

cosmo-fetch.cwd = "dist/cosmo"
cosmo-fetch.shell = """
  wget -N https://cosmo.zip/pub/cosmos/bin/python;
  chmod +x python;
  cp python $PKG.zip;
"""

cosmo-compile = """
  ./dist/cosmo/python -m compileall -b $DIR_SITE/$PKG;
  find $DIR_SITE/$PKG -name "*.py" -delete -print;
"""

cosmo-update.cwd = "dist/cosmo"
cosmo-update.shell = """
  zip -r $PKG.zip .args Lib;
  zip -d $PKG.zip 'Lib/site-packages/pip*';
  zip -d $PKG.zip 'usr/*';
  mv $PKG.zip $PKG;
"""

cosmo = ["cosmo-*"]
```

We could, of course, do this as a single command (which is how it currently is in `ds`), but I think this example illustrates how `ds` works in practice.

The `_.env` lines at the beginning set some environment variables for all tasks and `cosmo` at the end will run all the tasks that start with `cosmo-` (in the order in which they appear in the file).

First, we have `cosmo-clean` which deletes any previous compiled code. Next, `cosmo-setup` creates all the necessary directories (and their parents, if missing) and the special `.args` file which are the arguments to the `python` executable to run so that we don't trigger the REPL.

Then `cosmo-fetch` downloads the latest Cosmopolitan Python which is a fancy zip file. The `wget -N` will only download the file if it is newer than the one we already have. We set the executable bit and copy it to a `.zip` extension so that the `zip` program can operate on it properly. The place I [copied this from](https://github.com/tekknolagi/scrapscript/blob/67b74f2d4f20e913cbc4996c1de4341d6457a8da/build-com#L10) did a clever thing of also downloading a Cosmpolitan Zip which runs everywhere.

`cosmo-compile` then uses the Cosmopolitan Python executable to compile all the `.py` files into `.pyc` and delete all the `.py` files. We delete them so that they don't get added to the `.zip`.

Finally, we add the `.args` file and `Lib` folder to the `.zip`. We remove the pre-packaged `pip` and `usr/` directories to remove about 3.4 MB of files we don't need packaged with our executable. We rename the `.zip` and we're done.

We run this whole process with `ds cosmo`.
