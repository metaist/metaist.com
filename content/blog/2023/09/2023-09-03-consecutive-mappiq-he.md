---
published: "2023-09-03T15:09:28Z"
updated: "2023-11-28T17:09:10Z"
title: Consecutive Mappiq He
tags: ["Torah", "concordance", "Harold Zazula"]
---

**Harold Zazula** asks: What is the longest consecutive string of words with a [mappiq he](https://en.wikipedia.org/wiki/Mappiq).

To figure this out, let's use the [Leningrad Codex](https://tanach.us/Books/Tanach.xml.zip) which has a nice XML representation of all of Tanach. You need to download this bit manually to avoid 403 errors.

```bash
unzip Tanach.xml.zip
cd Books
python
```

```python
from pathlib import Path
from bs4 import BeautifulSoup

URL_SEFARIA = "https://www.sefaria.org/{book}.{chap}.{verse}"

print("| count | ref | words |")
print("|-------|-----|-------|")
# iterate over each xml file alphabetically (to keep things deterministic)
for path in sorted(Path(".").glob("*.xml")):
    # ignore extraneous files
    if ".DH" in path.name or "Index" in path.name:
        continue
    # load the xml file; require lxml library
    soup = BeautifulSoup(path.read_text(), features="xml")
    words = soup.find_all("w") # get all the words
    streak = [] # reset our streak of found words
    for word in words:
        if "הּ" in word.text:  # if this word has a mappiq-he
            streak.append(word)  # add it to the streak
        elif streak: # otherwise, we'll need to reset the streak
            if len(streak) > 1:  # we should print streaks longer than 1 word
                # save a reference to chapter:verse
                book = path.stem
                chap = streak[0].parent.parent["n"]
                verse = streak[0].parent["n"]
                seq = ", ".join([w.text.strip() for w in streak])
                ref = f"{book} {chap}:{verse}"
                url = URL_SEFARIA.format(book=book, chap=chap, verse=verse)
                print(f"|{len(streak)}|[{ref}]({url})|{seq}|")
            streak = []  # reset the streak
```

<!-- cspell:disable -->

| count | ref                                                            | words                                                   |
| ----- | -------------------------------------------------------------- | ------------------------------------------------------- |
| 2     | [Daniel 2:48](https://www.sefaria.org/Daniel.2.48)             | לֵ֔הּ, וְהַ֨שְׁלְטֵ֔הּ                                  |
| 2     | [Daniel 4:29](https://www.sefaria.org/Daniel.4.29)             | יִתְּנִנַּֽהּ׃, בַּהּ־                                  |
| 2     | [Daniel 5:2](https://www.sefaria.org/Daniel.5.2)               | שֵׁגְלָתֵ֖הּ, וּלְחֵנָתֵֽהּ׃                            |
| 2     | [Daniel 5:3](https://www.sefaria.org/Daniel.5.3)               | שֵׁגְלָתֵ֖הּ, וּלְחֵנָתֵֽהּ׃                            |
| 2     | [Daniel 5:20](https://www.sefaria.org/Daniel.5.20)             | לִבְבֵ֔הּ, וְרוּחֵ֖הּ                                   |
| 2     | [Daniel 6:11](https://www.sefaria.org/Daniel.6.11)             | לֵהּ֙, בְּעִלִּיתֵ֔הּ                                   |
| 2     | [Daniel 7:23](https://www.sefaria.org/Daniel.7.23)             | וּתְדוּשִׁנַּ֖הּ, וְתַדְּקִנַּֽהּ׃                      |
| 2     | [Daniel 11:6](https://www.sefaria.org/Daniel.11.6)             | וְהַיֹּ֣לְדָ֔הּ, וּמַחֲזִקָ֖הּ                          |
| 3     | [Deuteronomy 21:14](https://www.sefaria.org/Deuteronomy.21.14) | בָּ֗הּ, וְשִׁלַּחְתָּהּ֙, לְנַפְשָׁ֔הּ                  |
| 2     | [Deuteronomy 24:1](https://www.sefaria.org/Deuteronomy.24.1)   | בְּיָדָ֔הּ, וְשִׁלְּחָ֖הּ                               |
| 2     | [Deuteronomy 24:3](https://www.sefaria.org/Deuteronomy.24.3)   | בְּיָדָ֔הּ, וְשִׁלְּחָ֖הּ                               |
| 4     | [Deuteronomy 28:56](https://www.sefaria.org/Deuteronomy.28.56) | חֵיקָ֔הּ, וּבִבְנָ֖הּ, וּבְבִתָּֽהּ׃, וּֽבְשִׁלְיָתָ֞הּ |
| 2     | [Esther 2:7](https://www.sefaria.org/Esther.2.7)               | וְאִמָּ֔הּ, לְקָחָ֧הּ                                   |
| 2     | [Exodus 21:8](https://www.sefaria.org/Exodus.21.8)             | יְעָדָ֖הּ, וְהֶפְדָּ֑הּ                                 |
| 3     | [Exodus 21:10](https://www.sefaria.org/Exodus.21.10)           | שְׁאֵרָ֛הּ, כְּסוּתָ֥הּ, וְעֹנָתָ֖הּ                    |
| 2     | [Exodus 25:31](https://www.sefaria.org/Exodus.25.31)           | יְרֵכָ֣הּ, וְקָנָ֔הּ                                    |
| 2     | [Exodus 37:17](https://www.sefaria.org/Exodus.37.17)           | יְרֵכָ֣הּ, וְקָנָ֔הּ                                    |
| 2     | [Ezekiel 12:19](https://www.sefaria.org/Ezekiel.12.19)         | אַרְצָהּ֙, מִמְּלֹאָ֔הּ                                 |
| 2     | [Ezekiel 24:6](https://www.sefaria.org/Ezekiel.24.6)           | בָ֔הּ, וְחֶ֨לְאָתָ֔הּ                                   |
| 2     | [Ezekiel 24:7](https://www.sefaria.org/Ezekiel.24.7)           | דָמָהּ֙, בְּתוֹכָ֣הּ                                    |
| 2     | [Ezekiel 24:11](https://www.sefaria.org/Ezekiel.24.11)         | בְתוֹכָהּ֙, טֻמְאָתָ֔הּ                                 |
| 2     | [Ezekiel 30:21](https://www.sefaria.org/Ezekiel.30.21)         | לְחָבְשָׁ֥הּ, לְחָזְקָ֖הּ                               |
| 2     | [Genesis 2:15](https://www.sefaria.org/Genesis.2.15)           | לְעָבְדָ֖הּ, וּלְשָׁמְרָֽהּ׃                            |
| 2     | [Genesis 3:6](https://www.sefaria.org/Genesis.3.6)             | לְאִישָׁ֛הּ, עִמָּ֖הּ                                   |
| 2     | [Genesis 13:17](https://www.sefaria.org/Genesis.13.17)         | לְאָרְכָּ֖הּ, וּלְרָחְבָּ֑הּ                            |
| 2     | [Genesis 19:33](https://www.sefaria.org/Genesis.19.33)         | בְּשִׁכְבָ֖הּ, וּבְקוּׄמָֽהּ׃4                          |
| 2     | [Genesis 19:35](https://www.sefaria.org/Genesis.19.35)         | בְּשִׁכְבָ֖הּ, וּבְקֻמָֽהּ׃                             |
| 2     | [Genesis 35:17](https://www.sefaria.org/Genesis.35.17)         | בְהַקְשֹׁתָ֖הּ, בְּלִדְתָּ֑הּ                           |
| 4     | [Hosea 2:13](https://www.sefaria.org/Hosea.2.13)               | מְשׂוֹשָׂ֔הּ, חַגָּ֖הּ, חָדְשָׁ֣הּ, וְשַׁבַּתָּ֑הּ      |
| 2     | [Hosea 2:14](https://www.sefaria.org/Hosea.2.14)               | גַּפְנָהּ֙, וּתְאֵ֣נָתָ֔הּ                              |
| 2     | [Hosea 2:15](https://www.sefaria.org/Hosea.2.15)               | נִזְמָהּ֙, וְחֶלְיָתָ֔הּ                                |
| 3     | [Isaiah 5:14](https://www.sefaria.org/Isaiah.5.14)             | הֲדָרָ֧הּ, וַהֲמוֹנָ֛הּ, וּשְׁאוֹנָ֖הּ                  |
| 2     | [Isaiah 9:6](https://www.sefaria.org/Isaiah.9.6)               | אֹתָהּ֙, וּֽלְסַעֲדָ֔הּ                                 |
| 2     | [Isaiah 23:18](https://www.sefaria.org/Isaiah.23.18)           | סַחְרָ֜הּ, וְאֶתְנַנָּ֗הּ                               |
| 2     | [Isaiah 28:4](https://www.sefaria.org/Isaiah.28.4)             | אוֹתָ֔הּ, בְּעוֹדָ֥הּ                                   |
| 2     | [Isaiah 30:13](https://www.sefaria.org/Isaiah.30.13)           | שִׁבְרָֽהּ׃, וּ֠שְׁבָרָהּ                               |
| 2     | [Isaiah 38:11](https://www.sefaria.org/Isaiah.38.11)           | יָ֔הּ, יָ֖הּ                                            |
| 2     | [Isaiah 55:10](https://www.sefaria.org/Isaiah.55.10)           | וְהוֹלִידָ֖הּ, וְהִצְמִיחָ֑הּ                           |
| 3     | [Isaiah 62:1](https://www.sefaria.org/Isaiah.62.1)             | כַנֹּ֙גַהּ֙, צִדְקָ֔הּ, וִישׁוּעָתָ֖הּ                  |
| 2     | [Jeremiah 2:7](https://www.sefaria.org/Jeremiah.2.7)           | פִּרְיָ֖הּ, וְטוּבָ֑הּ                                  |
| 2     | [Jeremiah 15:9](https://www.sefaria.org/Jeremiah.15.9)         | נַפְשָׁ֛הּ, שִׁמְשָׁ֛הּ                                 |
| 2     | [Jeremiah 33:2](https://www.sefaria.org/Jeremiah.33.2)         | אוֹתָ֛הּ, לַהֲכִינָ֖הּ                                  |
| 2     | [Jeremiah 50:29](https://www.sefaria.org/Jeremiah.50.29)       | לָ֣הּ, כְּפָעֳלָ֔הּ                                     |
| 2     | [Job 22:12](https://www.sefaria.org/Job.22.12)                 | אֱ֭לוֹהַּ, גֹּ֣בַהּ                                     |
| 3     | [Job 28:27](https://www.sefaria.org/Job.28.27)                 | רָ֭אָהּ, וַֽיְסַפְּרָ֑הּ, הֱ֝כִינָ֗הּ                   |
| 2     | [Job 39:17](https://www.sefaria.org/Job.39.17)                 | הִשָּׁ֣הּ, אֱל֣וֹהַּ                                    |
| 2     | [Joshua 8:2](https://www.sefaria.org/Joshua.8.2)               | שְׁלָלָ֥הּ, וּבְהֶמְתָּ֖הּ                              |
| 2     | [Kings_2 4:14](https://www.sefaria.org/II_Kings.4.14)          | לָ֖הּ, וְאִישָׁ֥הּ                                      |
| 2     | [Leviticus 2:2](https://www.sefaria.org/Leviticus.2.2)         | מִסָּלְתָּהּ֙, וּמִשַּׁמְנָ֔הּ                          |
| 3     | [Leviticus 2:16](https://www.sefaria.org/Leviticus.2.16)       | אַזְכָּרָתָ֗הּ, מִגִּרְשָׂהּ֙, וּמִשַּׁמְנָ֔הּ          |
| 2     | [Leviticus 15:19](https://www.sefaria.org/Leviticus.15.19)     | זֹבָ֖הּ, בִּבְשָׂרָ֑הּ                                  |
| 2     | [Numbers 29:16](https://www.sefaria.org/Numbers.29.16)         | מִנְחָתָ֖הּ, וְנִסְכָּֽהּ׃                              |
| 2     | [Numbers 29:22](https://www.sefaria.org/Numbers.29.22)         | וּמִנְחָתָ֖הּ, וְנִסְכָּֽהּ׃                            |
| 2     | [Numbers 29:25](https://www.sefaria.org/Numbers.29.25)         | מִנְחָתָ֖הּ, וְנִסְכָּֽהּ׃                              |
| 2     | [Numbers 29:28](https://www.sefaria.org/Numbers.29.28)         | וּמִנְחָתָ֖הּ, וְנִסְכָּֽהּ׃                            |
| 2     | [Numbers 29:34](https://www.sefaria.org/Numbers.29.34)         | מִנְחָתָ֖הּ, וְנִסְכָּֽהּ׃                              |
| 2     | [Numbers 29:38](https://www.sefaria.org/Numbers.29.38)         | וּמִנְחָתָ֖הּ, וְנִסְכָּֽהּ׃                            |
| 2     | [Numbers 30:5](https://www.sefaria.org/Numbers.30.5)           | נִדְרָ֗הּ, וֽ͏ֶאֱסָרָהּ֙                                 |
| 2     | [Numbers 30:15](https://www.sefaria.org/Numbers.30.15)         | לָ֥הּ, אִישָׁהּ֮                                        |
| 2     | [Proverbs 3:16](https://www.sefaria.org/Proverbs.3.16)         | בִּֽימִינָ֑הּ, בִּ֝שְׂמֹאולָ֗הּ                         |
| 2     | [Proverbs 5:3](https://www.sefaria.org/Proverbs.5.3)           | חִכָּֽהּ׃, וְֽ֭אַחֲרִיתָהּ                              |
| 2     | [Proverbs 31:28](https://www.sefaria.org/Proverbs.31.28)       | בַּ֝עְלָ֗הּ, וַֽיְהַֽלְלָהּ׃                            |
| 2     | [Psalms 105:45](https://www.sefaria.org/Psalms.105.45)         | יָֽהּ׃, הַֽלְלְויָ֨הּc ׀                                |
| 2     | [Psalms 148:14](https://www.sefaria.org/Psalms.148.14)         | יָֽהּ׃, הַ֥לְלוּיָ֨הּ ׀                                 |
| 2     | [Psalms 149:9](https://www.sefaria.org/Psalms.149.9)           | יָֽהּ׃, הַ֥לְלוּיָ֨הּ ׀                                 |
| 2     | [Ruth 1:22](https://www.sefaria.org/Ruth.1.22)                 | כַלָּתָהּ֙, עִמָּ֔הּ                                    |
| 2     | [Ruth 2:19](https://www.sefaria.org/Ruth.2.19)                 | לָ֨הּ, חֲמוֹתָ֜הּ                                       |
| 2     | [I_Samuel 17:51](https://www.sefaria.org/I_Samuel.17.51)       | וַֽיִּשְׁלְפָ֤הּ, מִתַּעְרָהּ֙                          |
| 2     | [II_Samuel 3:16](https://www.sefaria.org/II_Samuel.3.16)       | אִתָּ֜הּ, אִישָׁ֗הּ                                     |
| 2     | [II_Samuel 10:3](https://www.sefaria.org/II_Samuel.10.3)       | וּלְרַגְּלָ֣הּ, וּלְהָפְכָ֔הּ                           |
| 2     | [II_Samuel 12:29](https://www.sefaria.org/II_Samuel.12.29)     | בָּ֖הּ, וַֽיִּלְכְּדָֽהּ׃                               |
| 2     | [Zechariah 4:2](https://www.sefaria.org/Zechariah.4.2)         | כֻּלָּ֜הּ, וְגֻלָּ֣הּ                                   |

<!-- cspell:enable -->

Luckily there aren't that many results, so by visual inspection we can see that the maximum number of consecutive words with a mappiq he is 4 in [Deuteronomy 28:56](https://www.sefaria.org/Deuteronomy.28.56) (with one word in the next verse) and [Hosea 2:13](https://www.sefaria.org/Hosea.2.13) (all in one verse with another mappiq-he two words later).

## Updates

### <span class="rel-date" title="2023-11-28T17:09:10Z">2023-11-28</span>

- Updated broken links.
