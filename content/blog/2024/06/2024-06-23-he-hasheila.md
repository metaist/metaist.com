---
created: "2024-06-23T20:30:51Z"
updated: "2024-06-23T20:30:51Z"
title: "Maximum He HaShe'elah"
tags: ["Torah", "concordance", "Harold Zazula"]
---

_Previously: [Consecutive Mappiq He](/blog/2023/09/consecutive-mappiq-he.html), [Non-Consecutive Mappiq He](/blog/2023/09/non-consecutive-mappiq-he.html)_

**Harold Zazula** asks: What is the largest number of _He HaShe'elah_ ([interrogative prefix](https://en.wikipedia.org/wiki/Prefixes_in_Hebrew#Interrogative)) in a pasuk or parsha?

Both Harold and Wikipedia helpfully tell us that the vowel under an interrogative prefix is _chataf patach_.

First, let's see how many verses have more than two words that start with a _He_ and a _chataf patach_:

```python
from pathlib import Path
from bs4 import BeautifulSoup

URL_SEFARIA = "https://www.sefaria.org/{book}.{chap}.{verse}"

print("| count | ref |")
print("|-------|-----|")
for path in sorted(Path(".").glob("*.xml")):
    # ignore extraneous files
    if ".DH" in path.name or "Index" in path.name:
        continue
    # load the xml file; require lxml library
    soup = BeautifulSoup(path.read_text(), features="xml")
    for verse in soup.find_all("v"):
        count = sum([
          1 if word.text.startswith("הֲ") else 0
          for word in verse.find_all("w")
        ])
        if count > 2:
            book = path.stem
            chap_num = verse.parent["n"]
            verse_num = verse["n"]
            ref = f"{book} {chap_num}:{verse_num}"
            url = URL_SEFARIA.format(book=book, chap=chap_num, verse=verse_num)
            print(f"|{count}|[{ref}]({url})|")
```

| count | ref                                                          |
| ----- | ------------------------------------------------------------ |
| 9     | [Daniel 5:19](https://www.sefaria.org/Daniel.5.19)           |
| 4     | [Ecclesiastes 1:2](https://www.sefaria.org/Ecclesiastes.1.2) |
| 5     | [Isaiah 40:21](https://www.sefaria.org/Isaiah.40.21)         |
| 3     | [Isaiah 58:5](https://www.sefaria.org/Isaiah.58.5)           |
| 3     | [I Kings 20:33](https://www.sefaria.org/I_Kings.20.33)       |
| 3     | [II Kings 4:26](https://www.sefaria.org/II_Kings.4.26)       |
| 3     | [Psalms 94:9](https://www.sefaria.org/Psalms.94.9)           |

Let's take a look at each of these results.

- [Daniel 5:19](https://www.sefaria.org/Daniel.5.19) is in Aramaic. But it does indicate that having a [_maqaf_](https://en.wikipedia.org/wiki/Hebrew_punctuation#Hyphen_and_maqaf) immediately before this word should maybe disqualify the current word.

- [Ecclesiastes 1:2](https://www.sefaria.org/Ecclesiastes.1.2) the word הֲבֵל
  is getting picked up. Maybe I should just exclude that word.

- [Isaiah 40:21](https://www.sefaria.org/Isaiah.40.21) has the word הֲלוֹא four times which is an appropriate match.

- [Isaiah 58:5](https://www.sefaria.org/Isaiah.58.5) has the words הֲכָזֶה, הֲלָכֹף
  , and הֲלָזֶה which are all appropriate.

- [I Kings 20:33](https://www.sefaria.org/I_Kings.20.33) has words that are all weird or not a match: הֲמִמֶּנּוּ and הֲדַד (twice, but after a _maqaf_).

- [II Kings 4:26](https://www.sefaria.org/II_Kings.4.26) has הֲשָׁלוֹם three times which is an appropriate match.

- [Psalms 94:9](https://www.sefaria.org/Psalms.94.9) has הֲנֹטַע and הֲלֹא (twice) which are both appropriate.

In our next experiments we can try out:

- Ignore words preceded by a _maqaf_.
- Most consecutive verses with a _He HaShe'elah_.
- Chapter with the most verses containing a _He HaShe'elah_.
- Parsha with the most verses containing a _He HaShe'elah_.
