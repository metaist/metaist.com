---
created: "2024-09-30T21:38:21Z"
updated: "2024-09-30T21:38:21Z"
title: "Google Drive Links: rclone"
tags: ["gdrive", "rclone"]
series: "gdrive"
description: "How I actually get Google Drive links for many documents at once."
---

_Previously: [Problem: Google Drive Links](/blog/2023/07/google-drive-links.html), [Workspace Add-On](/blog/2023/07/google-drive-links-workspace-add-on.html)_

It's been over a year since I wrote a [Google Drive Workspace Add-On to get multiple links from documents](/blog/2023/07/google-drive-links-workspace-add-on.html). However, the add-on was rejected because the video I made didn't meet their requirements. And while I hope to eventually fix the video and resubmit, I ended up with a completely different solution that I've been using on Linux and macOS.

Let me introduce [`rclone`](https://rclone.org/): it's like `sftp` but for every cloud provider, including Google Drive.

After installing you need to run `rclone config` to set up a remote name for the Google Drive you want to interact with. Then create a folder to mount the remote into using `rclone mount $name: $GDRIVE_ROOT --daemon`. This works like any other `mount` command.

I wrote a python script that can take one or more locations relative to `$GDRIVE_ROOT` and return HTML that can be pasted into an email. I discuss the relevant bits below.

First, I define a few objects to describe the input files (`PathInfo`), the intermediate data retrieved from `rclone` (`RCloneInfo`), and the output format with information about `gdrive` (`GDriveInfo`).

```python
from typing import NamedTuple

class PathInfo(NamedTuple):
    path: Path
    is_dir: bool


class RCloneInfo(NamedTuple):
    Path: str
    Name: str
    Size: int
    # MimeType: str
    ModTime: str
    IsDir: bool
    ID: str


class GDriveInfo(NamedTuple):
    name: str
    url: str

    @staticmethod
    def from_rclone(item: RCloneInfo) -> GDriveInfo:
        """Return a `GDriveInfo` from an `RCloneInfo`."""
        return GDriveInfo(item.Name, f"https://drive.google.com/open?id={item.ID}")
```

I learned how to access a Google Drive document directly from [Amit Agarwal's great post on Google Drive URL tricks](https://www.labnol.org/internet/direct-links-for-google-drive/28356/).

Next, I define some helper functions to deal with local and remote paths.

```python
from pathlib import Path
from typing import Dict
from typing import List

def is_relative_to(self: Path, *other: Path) -> bool:
    """Return `True` if `other` is relative to `self`.

    See: https://github.com/python/cpython/blob/41756e3960a38249b9e0076412ef5e08625a7acc/Lib/pathlib.py#L736
    """
    try:
        self.relative_to(*other)
        return True
    except ValueError:
        return False


def group_by_parent(paths: List[Path]) -> Dict[Path, List[Path]]:
    """Return a mapping of parent paths mapped to a list of children paths."""
    result: Dict[Path, List[Path]] = {}
    for path in paths:
        parent = path.parent
        if parent in result:
            result[parent].append(path)
        else:
            result[parent] = [path]
    return result


def remote_path(path: Path) -> str:
    """Convert a path to a remote path."""
    relpath = path.relative_to(PATH_GDRIVE)
    remote = str(relpath).replace("/", ":", 1)  # first slash becomes a colon
    if ":" not in remote:
        remote += ":"  # if you're at the top level
    return remote
```

Then, I define functions for fetching information about `gdrive` through `rclone`.

```python
from subprocess import run

def rclone_lsjson(remote: str, *args: str) -> List[RCloneInfo]:
    """Return rclone info about `remote`."""
    cmd = ["rclone", "lsjson", remote, "--no-modtime", "--no-mimetype"] + list(args)
    proc = run(cmd, capture_output=True)
    return [RCloneInfo(**data) for data in json.loads(proc.stdout)]


def gdrive_by_path(path: Path) -> List[GDriveInfo]:
    """Return info by searching for a path."""
    remote = remote_path(path)
    items = rclone_lsjson(remote)
    return [GDriveInfo.from_rclone(item) for item in items]


def gdrive_by_name(parent: Path, props: Dict[str, PathInfo]) -> List[GDriveInfo]:
    """Return info by searching for names in a directory."""
    remote = remote_path(parent)
    items = rclone_lsjson(remote)
    return [
        GDriveInfo.from_rclone(item)
        for item in items
        if item.Name in props and item.IsDir == props[item.Name].is_dir
    ]


def gdrive_info(paths: List[Path]) -> List[GDriveInfo]:
    """Return GDrive url and name for several paths."""
    result = {path: None for path in paths}
    for parent, children in group_by_parent(paths).items():
        if len(children) == 1 and not children[0].is_dir():
            # one child, non-directory
            path = children[0]
            result[path] = gdrive_by_path(path)[0]
        else:  # multiple children or single directory
            props = {
                p.name: PathInfo(p, p.is_dir())  # assumes unique names
                for p in children
            }
            items = gdrive_by_name(parent, props)
            for item in items:
                path = props[item.name].path
                result[path] = item

    return [v for v in result.values() if v]
```

Most of the work is being done by [`rclone lsjson`](https://rclone.org/commands/rclone_lsjson/) which returns JSON information about specific paths. I learned a lot from [this forum post about getting the folder id for a Google Drive path](https://forum.rclone.org/t/get-folder-id-for-google-drive-directory/35480).

One thing that can be surprising about Google Drive is that it is an ID-based file system so it is possible to have multiple files with the exact same name in the same folder. If we set that aside, the main thing we need is to be able to grab the folder our files are contained in so that we can efficiently query Google Drive for multiple files at once and use the single response to construct our output.

```python
def render_html(items: List[GDriveInfo]) -> str:
    """Return a list of items as HTML."""
    result = []
    pre, post = "", ""
    many = len(items) > 1
    if many:
        result.append("<ul>")
        pre, post = "\t<li>", "</li>"

    for item in items:
        result.append(f'{pre}<a href="{item.url}">{item.name}</a>{post}')

    if many:
        result.append("</ul>")
    return "\n".join(result)
```

Inspired by [Commands with Comma](https://rhodesmill.org/brandon/2009/commands-with-comma/), I named this `,gdrive-id.py`.

However, that's not very accessible. I don't want to have to open a terminal just to get some URLs. In the next part, I describe how I added context menus in Thunar and macOS Finder to make my life easier.
