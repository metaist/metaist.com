---
created: "2023-09-05T15:28:16Z"
updated: "2023-12-01T02:39:24Z"
title: "Preventing link rot"
tags: ["trace", "freshlinks"]
description: "An initial approach for checking for link rot."
---

Rebooting the blog reminded me that one worry I often have is dealing with [link rot](https://en.wikipedia.org/wiki/Link_rot).

## Rough Idea

- Fetch the content of a link.
  - If the link does not come back:
    - note the kind of error (404, 4xx, 5xx)
    - move on to the next link
  - If the link comes back:
    - record the success
    - if domain of the link is different than the target domain: move on to next link
    - look for references to other resources and add them to the queue
      - `<* href="$URL">` - a, area, base, link
      - `<* src="$URL">` - audio, embed, iframe, img, input, script, source, track, video

## Attempt 1: Naive Approach

Let's get this working in the most straightforward way first.

```python
# lib
from bs4 import BeautifulSoup
import requests

def main():
    BASE_URL = "http://localhost:8080"
    target = "http://localhost:8080/blog"

    todo, done = [], {}
    todo.append(target)

    while todo:
        link = todo.pop()
        if link in done:
            continue
        # link is new

        try:
            req = requests.get(link, timeout=3)
            done[link] = dict(code=req.status_code)
            print(f"{req.status_code} {link}")
            if req.status_code != 200:
                continue
        except Exception as e:
            done[link] = dict(code="ERR")
            print(f"ERR {link}", e)
            continue
        # link is good

        if not link.startswith(target):
            continue
        # link should be scraped

        soup = BeautifulSoup(req.content, features="html.parser")
        for tag in soup.select("[src],[href]"):
            next_link = ""
            if "src" in tag.attrs:
                next_link = tag["src"]
            elif "href" in tag.attrs:
                next_link = tag["href"]

            if next_link.startswith("#"):  # ignore fragments
                continue
            elif next_link.startswith("/"):
                next_link = f"{BASE_URL}{next_link}"

            if next_link:
                todo.append(next_link)


if __name__ == "__main__":
    main()
```

This takes about 6 minutes to run on my locally-hosted version of my blog. Kinda slow, but a fine start. I also discover that [my port to `eleventy` missed an important variable](/blog/2023/05/adventures-in-eleventy.html).

## Attempt 2: Naive Parallel

Normally, I'd reach for `ezq` to do this processing in parallel except that `todo` grows as you scrape, so there's not obvious place to send the `END_MSG`. Who should notify workers they are done?

```python
# lib
from bs4 import BeautifulSoup
from multiprocess import Manager
import ezq
import requests

BASE_URL = "http://localhost:8080"


def is_alive(link, done):
    ok, req = True, None
    try:
        req = requests.get(link, timeout=3)
        done[link] = dict(code=req.status_code)
        print(f"{req.status_code} {link}")
        if req.status_code != 200:
            ok = False
    except Exception as e:
        ok = False
        done[link] = dict(code="ERR")
        print(f"ERR {link}", e)
    return ok, req


def add_links(req, todo):
    soup = BeautifulSoup(req.content, features="html.parser")
    for tag in soup.select("[src],[href]"):
        next_link = ""
        if "src" in tag.attrs:
            next_link = tag["src"]
        elif "href" in tag.attrs:
            next_link = tag["href"]

        if next_link.startswith("#"):  # ignore fragments
            continue
        elif next_link.startswith("/"):
            next_link = f"{BASE_URL}{next_link}"

        if next_link:
            todo.append(next_link)


def worker(todo: list, done: dict):
    while todo:
        link = todo.pop()
        if link in done:
            continue
        # link is new

        ok, req = is_alive(link, done)
        if not ok:
            continue
        # link is good

        if not link.startswith(BASE_URL):
            continue
        # link should be scraped

        add_links(req, todo)


def main():
    with Manager() as manager:
        todo, done = manager.list(), manager.dict()

        _, req = is_alive(f"{BASE_URL}/blog", done)
        add_links(req, todo)

        for w in [ezq.run(worker, todo, done) for _ in range(ezq.NUM_CPUS)]:
            w.join()


if __name__ == "__main__":
    main()
```

This takes about 40 seconds. I do find the `ezq` wrappers are still nicer than creating `Process` objects, but now there are a few race conditions:

- checking if a link was processed may return `False` to two workers
- adding links to `todo` may take too long and workers may start shutting down prematurely

## Approach 3: Parallel with Sleeps

So now we protect (a little bit) against `.pop` from an empty list and from a worker ending early by adding `sleep` to the top and bottom of the `for` loop. We also restructure the `continue` statements so that we don't accidentally end too early.

```python
# native
from time import sleep

# lib
from bs4 import BeautifulSoup
from multiprocess import Manager
import ezq
import requests

BASE_URL = "http://localhost:8080"


def is_alive(link, done):
    ok, req = True, None
    try:
        req = requests.get(link, timeout=3)
        done[link] = dict(code=req.status_code)
        print(f"{req.status_code} {link}")
        if req.status_code != 200:
            ok = False
    except Exception as e:
        ok = False
        done[link] = dict(code="ERR")
        print(f"ERR {link}", e)
    return ok, req


def add_links(text):
    soup = BeautifulSoup(text, features="html.parser")
    for tag in soup.select("[src],[href]"):
        next_link = ""
        if "src" in tag.attrs:
            next_link = tag["src"]
        elif "href" in tag.attrs:
            next_link = tag["href"]

        if next_link.startswith("#"):  # ignore fragments
            continue
        elif next_link.startswith("/"):
            next_link = f"{BASE_URL}{next_link}"

        if next_link:
            yield next_link


def worker(todo: list, done: dict):
    while todo:
        if not todo:
            sleep(3)
            continue

        link = todo.pop()
        if link not in done:  # new link
            done[link] = None  # prevent other workers
            ok, req = is_alive(link, done)
            if ok and link.startswith(BASE_URL):  # scrape this link
                for item in add_links(req.content):
                    if item not in done:  # only add new links
                        todo.append(item)

        if not todo:  # maybe we're all done
            sleep(3)


def main():
    with Manager() as manager:
        todo, done = manager.list(), manager.dict()

        _, req = is_alive(f"{BASE_URL}/blog", done)
        for link in add_links(req.content):
            todo.append(link)

        for w in [ezq.run(worker, todo, done) for _ in range(ezq.NUM_CPUS)]:
            w.join()


if __name__ == "__main__":
    main()
```

This also takes about 40 seconds but with fewer differences in output from the initial naive version.

## Approach 4: Process the content type

Now that I've set up the skeleton, I'm noticing that there are bunch of content errors including trying to parse XML (Atom Feed) and getting lots of `403` responses. We can do a little better by processing the content-type.

```python
# native
from time import sleep
import re

# lib
from bs4 import BeautifulSoup
from multiprocess import Manager
import ezq
import requests

BASE_URL = "http://localhost:8080"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
}

RE_CSS_IMPORT = re.compile(r"""@import ["']([^"']+)""", re.MULTILINE)
RE_CSS_URL = re.compile(r"url\s*\(\s*([^)]+)\s*\)", re.MULTILINE)


def is_alive(link, done):
    ok, req = True, None
    try:
        req = requests.get(link, timeout=3, headers=HEADERS)
        done[link] = dict(code=req.status_code)
        print(f"{req.status_code} {link}")
        if req.status_code != 200:
            ok = False
    except Exception as e:
        ok = False
        done[link] = dict(code="ERR")
        print(f"ERR {link}", e)
    return ok, req


def get_css_links(req):
    text = req.text
    for pattern in [RE_CSS_IMPORT, RE_CSS_URL]:
        for link in pattern.findall(text):
            yield link


def get_xhtml_links(soup):
    for tag in soup.select("[src],[href]"):
        if "src" in tag.attrs:
            yield tag["src"]
        elif "href" in tag.attrs:
            yield tag["href"]


def add_links(req):
    ctype = req.headers["Content-Type"]
    if ctype.startswith("text/css") or req.url.endswith(".css"):
        links = get_css_links(req)
    elif ctype.startswith("text/xml") or req.url.endswith(".xml"):
        links = get_xhtml_links(BeautifulSoup(req.content, features="xml"))
    else:
        links = get_xhtml_links(BeautifulSoup(req.content, features="html.parser"))

    for link in links:
        if (
            link.startswith("#")  # fragment
            or link.startswith("mailto:")  # email
            or link.startswith("data:")  # base64-encoded data
        ):
            continue

        if link.startswith("/"):
            link = f"{BASE_URL}{link}"

        # TODO: add relative links

        if link:
            yield link


def worker(todo: list, done: dict):
    while todo:
        if not todo:
            sleep(3)
            continue

        link = todo.pop()
        if link not in done:  # new link
            done[link] = None  # prevent other workers
            ok, req = is_alive(link, done)
            if ok and link.startswith(BASE_URL):  # scrape this link
                for item in add_links(req):
                    if item not in done:  # only add new links
                        todo.append(item)

        if not todo:  # maybe we're all done
            sleep(3)


def main():
    with Manager() as manager:
        todo, done = manager.list(), manager.dict()

        _, req = is_alive(f"{BASE_URL}/blog", done)
        for link in add_links(req):
            todo.append(link)

        for w in [ezq.run(worker, todo, done) for _ in range(ezq.NUM_CPUS)]:
            w.join()


if __name__ == "__main__":
    main()
```

## Open Tasks

- [x] get links from XML (`[href]`)
- [x] get links from CSS (`@import`)
- [x] ignore `data:`
- [x] ignore `mailto:`
- [x] add cache
- [x] add args

## Updates

### <span class="rel-date" title="2023-11-28T17:09:10Z">2023-11-28</span>

- Updated broken links.

### <span class="rel-date" title="2023-12-01T02:39:24Z">2023-11-28</span>

- [`freshlinks 1.0.0`](https://github.com/metaist/freshlinks/releases/tag/1.0.0) is now published.
