---
created: "2023-06-05T14:13:10Z"
updated: "2023-06-05T14:13:10Z"
title: "apt segfault"
tags: ["trace", "apt"]
description: "One fix to apt crashing."
---

Tried doing a `apt upgrade -y` and got:

```text
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
Calculating upgrade... Done
[...]
Segmentation fault
```

Let's try to figure out how to fix this.

## Maybe it's the lock/cache

[This article](https://blog.opstree.com/2019/04/02/resolving-segmentation-fault-core-dumped-in-ubuntu/) suggests removing lock files and cleaning your cache. Worth trying.

```bash
sudo rm -rf /var/lib/apt/lists/lock /var/cache/apt/archives/lock /var/lib/dpkg/lock
sudo apt-get clean all
```

That worked!

## `autoremove` brings the segfault back

About once a month, I run `sudo apt autoremove` to get rid of old kernels and things that have accumulated. But now I notice that running that gets me a segfault which then causes all other `apt-get` commands to segfault too.

Just running `sudo apt-get clean all` restores the other `apt-get` commands.

Weird.
