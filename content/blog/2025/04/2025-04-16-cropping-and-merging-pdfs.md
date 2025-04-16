---
created: "2025-04-16T02:39:05Z"
updated: "2025-04-16T02:39:05Z"
title: "Cropping and Merging PDFs"
tags: ["pdf", "music", "Isaac Selya"]
description: "How to actually crop PDFs."
---

Here's a simple-sounding task: Crop the vocal and piano parts of a full orchestral score PDF (many pages) into a new condensed score (fewer pages). After talking it over with [Isaac Selya](https://isaacselya.com/) we discovered that, aside from the first page, both staves were in the same vertical position on every page.

I thought ChatGPT would nail this using [`pypdf`](https://github.com/py-pdf/pypdf) which was its first attempt. It couldn't find the correct coordinates for the cropping, but it gave me enough code that I could manually supply the coordinates. However, it was only able to crop each page into separate smaller pages, but not stack them on a new page. [Turns out](https://pypdf.readthedocs.io/en/stable/user/cropping-and-transforming.html):

> Just because content is no longer visible, it is not gone. Cropping works by adjusting the viewbox. That means content that was cropped away can still be restored.

That means any time I tried putting a "cropped" part of a page on a blank page, I'd get the whole page (with some vertical translation). I tried so many variations on the crop (e.g., crop to small pages in a new PDF, then try stacking _those_ pages), but just kept getting lots of pages of sheet music overlaid on top of each other.

Finally, ChatGPT mentioned that [`pymupdf`](https://pymupdf.readthedocs.io/en/latest/) might _actually_ crop PDFs in a way that destroys the content outside of view. The API made a lot of sense to me, especially the more normal X-Y coordinate system with an origin in the top-left (unlike other PDF libraries that use the bottom-left).

That got me this working result which cuts vertical rectangles out of pages and glues them together on new pages. The only hard-coded bit was the extra margin on the first page to make sure that the vocal and piano pieces stay together. If I ever have to do this again, I'll probably add it as a feature to my [`pdfmerge`](https://github.com/metaist/pdfmerge) tool.

```python
#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "attrbox",
#     "pymupdf",
# ]
# ///
"""
Usage: ,crop-pdf.py
    [--help|--version][--debug]
    <input> [--output PATH]
    <rules>...

Options:
    -h, --help              show this message
    --version               show program version
    --debug                 show debug messages

    <input>                 input path
    -o PATH, --output PATH  output path
    <rules>                 rules

Example:
,crop-pdf.py scan.pdf "1: 0-80, 171-252, 666-764; 2-: 150-240, 666-764"
"""
# std
from __future__ import annotations
from pathlib import Path
from dataclasses import dataclass
from dataclasses import field

# lib
from attrbox import parse_docopt
import pymupdf


__version__ = "1.0.0"


@dataclass
class Ranges:
    ranges: list[range] = field(default_factory=list)

    def __contains__(self, other: int) -> bool:
        return any(other in r for r in self.ranges)

    def __iter__(self):
        for r in self.ranges:
            yield from r

    def as_list(self) -> list[tuple[int, int]]:
        return [(r.start, r.stop) for r in self.ranges]

    @staticmethod
    def parse(s: str, beg: int = 1, end: int = 1000, inclusive: bool = False) -> Ranges:
        result = Ranges()
        for rule in s.split(","):
            if "-" in rule:
                left, right = rule.split("-")
                left = int(left) if left else beg
                right = int(right) if right else end
            else:
                left = int(rule)
                right = left
            result.ranges.append(range(left, right + (0 if inclusive else 1)))
        return result


@dataclass
class Rule:
    pages: Ranges
    parts: list[tuple[int, int]] = field(default_factory=list)

    def __contains__(self, other: int) -> bool:
        return other in self.pages

    def __iter__(self):
        for page in self.pages:
            for beg, end in self.parts:
                yield (page, beg, end)

    @staticmethod
    def parse(s: str, end: int) -> Rule:
        pages, parts = s.split(":")
        return Rule(
            Ranges.parse(pages, 1, end),
            Ranges.parse(parts, inclusive=True).as_list(),
        )


def main():
    args = parse_docopt(__doc__, version=__version__)
    args.input = Path(args.input)
    if not args.output:
        args.output = Path(args.input).with_stem(args.input.stem + "_crop")
    else:
        args.output = Path(args.output)

    if args.output.exists():
        args.output.unlink()

    if args.debug:
        print(args)

    doc = pymupdf.open(args.input)
    out = pymupdf.open()

    end = len(doc)
    rules: list[Rule] = []
    for rule in args.rules:
        rules.extend(Rule.parse(s, end) for s in rule.split(";"))
    if args.debug:
        print(rules)

    margin = 20
    dest = None
    y = margin
    out_page_n = 0
    for rule in rules:
        for idx, beg, end in rule:
            idx -= 1

            page = doc[idx]
            width = page.rect.width
            height = page.rect.height
            h = end - beg

            if (
                not dest
                or y + h > height - margin
                or (out_page_n == 1 and y + h > height - 100)
            ):
                print("new page")
                dest = out.new_page(-1, width=width, height=height)
                out_page_n += 1
                y = margin

            clip = pymupdf.Rect(0, beg, width, end)
            post = pymupdf.Rect(0, y, width, y + h)
            dest.show_pdf_page(post, doc, pno=idx, clip=clip)
            print(idx, beg, end)

            y += h

    out.ez_save(args.output)


if __name__ == "__main__":
    main()
```
