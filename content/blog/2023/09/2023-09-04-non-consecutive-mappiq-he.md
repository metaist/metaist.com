---
created: "2023-09-04T21:08:52Z"
updated: "2023-11-28T17:09:10Z"
title: "Non-Consecutive Mappiq He"
tags: ["Torah", "concordance"]
description: "What is the maximum number of mappiq he in any one verse?"
---

_Previously: [Consecutive Mappiq He](/blog/2023/09/consecutive-mappiq-he.html)_

A natural follow-up question to yesterday's post is: What is the maximum number of mappiq he in any one verse?

In some ways this is a simpler question because we just need to look verse-by-verse and we don't care about streaks.

```python
from pathlib import Path
from bs4 import BeautifulSoup

URL_SEFARIA = "https://www.sefaria.org/{book}.{chap}.{verse}"

print("| count | ref |")
print("|-------|-----|")
for path in sorted(Path(".").glob("*.xml")):
    if ".DH" in path.name or "Index" in path.name:
        continue
    soup = BeautifulSoup(path.read_text(), features="xml")
    for verse in soup.find_all("v"):
        count = sum([
          1 if "הּ" in word.text else 0
          for word in verse.find_all("w")
        ])
        if count > 3:
            book = path.stem
            chap_num = verse.parent["n"]
            verse_num = verse["n"]
            ref = f"{book} {chap_num}:{verse_num}"
            url = URL_SEFARIA.format(book=book, chap=chap_num, verse=verse_num)
            print(f"|{count}|[{ref}]({url})|")
```

| count | ref                                                            |
| ----- | -------------------------------------------------------------- |
| 4     | [Daniel 4:9](https://www.sefaria.org/Daniel.4.9)               |
| 4     | [Daniel 5:20](https://www.sefaria.org/Daniel.5.20)             |
| 4     | [Daniel 5:21](https://www.sefaria.org/Daniel.5.21)             |
| 4     | [Daniel 6:11](https://www.sefaria.org/Daniel.6.11)             |
| 4     | [Daniel 7:14](https://www.sefaria.org/Daniel.7.14)             |
| 4     | [Daniel 7:20](https://www.sefaria.org/Daniel.7.20)             |
| 5     | [Deuteronomy 21:14](https://www.sefaria.org/Deuteronomy.21.14) |
| 5     | [Deuteronomy 24:1](https://www.sefaria.org/Deuteronomy.24.1)   |
| 5     | [Deuteronomy 24:3](https://www.sefaria.org/Deuteronomy.24.3)   |
| 5     | [Deuteronomy 28:56](https://www.sefaria.org/Deuteronomy.28.56) |
| 4     | [Exodus 21:8](https://www.sefaria.org/Exodus.21.8)             |
| 4     | [Ezekiel 24:11](https://www.sefaria.org/Ezekiel.24.11)         |
| 5     | [Hosea 2:13](https://www.sefaria.org/Hosea.2.13)               |
| 5     | [Isaiah 5:14](https://www.sefaria.org/Isaiah.5.14)             |
| 4     | [Isaiah 45:18](https://www.sefaria.org/Isaiah.45.18)           |
| 4     | [Job 28:27](https://www.sefaria.org/Job.28.27)                 |
| 4     | [Joshua 8:2](https://www.sefaria.org/Joshua.8.2)               |
| 5     | [Joshua 10:30](https://www.sefaria.org/Joshua.10.30)           |
| 4     | [Joshua 10:37](https://www.sefaria.org/Joshua.10.37)           |
| 5     | [Joshua 10:39](https://www.sefaria.org/Joshua.10.39)           |
| 4     | [Joshua 19:47](https://www.sefaria.org/Joshua.19.47)           |
| 4     | [Kings_2 4:27](https://www.sefaria.org/II_Kings.4.27)          |
| 4     | [Kings_2 8:5](https://www.sefaria.org/II_Kings.8.5)            |
| 5     | [Lamentations 1:2](https://www.sefaria.org/Lamentations.1.2)   |
| 5     | [Leviticus 2:2](https://www.sefaria.org/Leviticus.2.2)         |
| 4     | [Leviticus 2:16](https://www.sefaria.org/Leviticus.2.16)       |
| 4     | [Leviticus 15:19](https://www.sefaria.org/Leviticus.15.19)     |
| 5     | [Leviticus 15:25](https://www.sefaria.org/Leviticus.15.25)     |
| 4     | [Leviticus 15:26](https://www.sefaria.org/Leviticus.15.26)     |
| 4     | [Leviticus 18:17](https://www.sefaria.org/Leviticus.18.17)     |
| 6     | [Numbers 5:27](https://www.sefaria.org/Numbers.5.27)           |
| 4     | [Numbers 13:32](https://www.sefaria.org/Numbers.13.32)         |
| 4     | [Numbers 19:5](https://www.sefaria.org/Numbers.19.5)           |
| 5     | [Numbers 30:5](https://www.sefaria.org/Numbers.30.5)           |
| 4     | [Numbers 30:6](https://www.sefaria.org/Numbers.30.6)           |
| 5     | [Numbers 30:9](https://www.sefaria.org/Numbers.30.9)           |
| 4     | [Numbers 30:12](https://www.sefaria.org/Numbers.30.12)         |
| 4     | [Numbers 30:13](https://www.sefaria.org/Numbers.30.13)         |
| 4     | [I_Samuel 1:23](https://www.sefaria.org/I_Samuel.1.23)         |
| 4     | [Zechariah 4:2](https://www.sefaria.org/Zechariah.4.2)         |

Lots of fours and fives, but there are **six** in [Numbers 5:27](https://www.sefaria.org/Numbers.5.27).

## Updates

### <span class="rel-date" title="2023-11-28T17:09:10Z">2023-11-28</span>

- Updated broken links.
