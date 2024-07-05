---
created: "2024-07-05T17:10:20Z"
updated: "2024-07-05T17:10:20Z"
title: "Screenshot Thumbnails"
tags: ["firefox", "imagemagick", "thumbnails", "metaist"]
description: "How I used Firefox & ImageMagick to take screenshots for posts without a thumbnail."
---

_Previously: [Trying pagefind](/blog/2024/07/trying-pagefind.html), [Adventures in Eleventy](/blog/2023/05/adventures-in-eleventy.html)_

One of the difficulties I described in [Adventures with Eleventy](/blog/2023/05/adventures-in-eleventy.html) is having to find a catchy thumbnail for each post. Part of the problem is that I wanted it to look a certain way and another part is that I wanted images that were appropriately licensed. That's why I've largely not had thumbnails for any posts since the most recent reboot in May 2023.

However, I wanted to start pushing my posts out to [twitter](https://twitter.com/TheMetaist) (and now [bluesky](https://bsky.app/profile/metaist.com)) and the lack of a thumbnail was bugging me. A simple solution would be to just automatically take a screenshot of the post and use that as the thumbnail.

At first, I thought I'd use Simon Willison's [`shot-scraper`](https://github.com/simonw/shot-scraper), but I didn't want to install [`puppeteer`](https://pptr.dev/) and a whole separate browser just to take screenshots.

But because I recently [switched back to Firefox](/blog/2024/06/trying-firefox.html) after many years, I decided to try out it's screenshot capabilities. Turns out they're pretty great! The only caveat is that you can't have Firefox open and take a screenshot at the same time-- unless you use a different profile. So I went to `about:profiles` and made profile called `screenshot`. Now I can take screenshots from the command-line:

```bash
# Usage: firefox -P <profile> --screenshot <output> <url>
firefox -P screenshot --screenshot metaist.png "https://metaist.com/"
```

According to ChatGPT, the ideal OpenGraph thumbnail should be 1200x630. Using [ImageMagick](https://imagemagick.org/index.php), I decided to also crop the top banner to focus on the main text.

```bash
# Usage: convert <input> -gravity north -crop 1200x630+0+100 +repage <output>
convert metaist.png -gravity north -crop 1200x630+0+100 +repage metaist.png
```

I put it all together using [`bun`](https://bun.sh/) and [`docopt`](https://www.npmjs.com/package/docopt).

```js
#!/usr/bin/env bun

import { $ } from "bun";
import { docopt } from "docopt";
import { resolve } from "bun:path";
import { unlinkSync } from "node:fs";

const doc = `\
Take cropped screenshots of URLs using Firefox.

Usage: ./screenshots.js
  [--help] [--version] [--debug]
  [--force] [--crop=<size>]
  [<slug>...]

Options:
  -h, --help        show this message and exit
  --version         show program version and exit
  --debug           show debug messages

  -f, --force       delete existing screenshot
  --crop=<size>     crop dimensions [default: 1200x630+0+100]
  <slug>            blog slug to screenshot
`;

/** Convert a slug to a local URL. */
const slug2url = (slug) =>
  `http://localhost:8080/blog/${slug.slice(0, 4)}/${slug.slice(
    5,
    7
  )}/${slug.slice(11)}.html`;

/** Return an absolute path to an image. */
const slug2img = (slug) => resolve(`./content/static/img/${slug}.png`);

/** Take a screenshot of a URL and save it to a path. */
const screenshot = async (url, path) =>
  $`firefox -P screenshot --screenshot ${path} ${url}`;

/** Crop an image. */
const crop = async (path, size = "1200x630+0+100") =>
  $`convert ${path} -gravity north -crop ${size} +repage ${path}`;

/** Get list of slugs from a file.  */
const getSlugs = async (path) =>
  (await Bun.file(path).text()).split("\n").reduce((result, line) => {
    line = line.trim();
    if (line && !line.startsWith("#")) result.push(line);
    return result;
  }, []);

/**
 * Return a valid javascript variable name from a docopt flag.
 * @param {string} name variable name
 */
function optvar(name) {
  let result = name.toLowerCase();
  const special = { "-": "stdin", "--": "__" };
  if (special[result]) return special[result];
  // special cases handled

  result = result.replace(/--/, "");
  if (result[0] === "-") result = result.slice(1);
  // leading hyphens removed

  result = result.replaceAll("-", "_").replaceAll("<", "").replaceAll(">", "");
  // hyphens become underscore; angle brackets removed

  return result;
}

/** Parse docopt vars into a javascript-friendly format. */
function parse_docopt(args) {
  const result = {};
  for (const [key, val] of Object.entries(args)) result[optvar(key)] = val;
  return result;
}

/** Main entry point. */
async function main() {
  const args = parse_docopt(docopt(doc, { version: "0.1.0" }));
  if (!args.slug.length) args.slug = await getSlugs("./screenshots.txt");
  console.log(`Found: ${args.slug.length}`);

  if (!args.crop) args.crop = "1200x630+0+100";
  if (args.crop.toLowerCase() === "none") args.crop = "";
  if (args.debug) console.log(args);

  for (var i = 0; i < args.slug.length; i++) {
    const slug = args.slug[i];
    const url = slug2url(slug);
    const img = slug2img(slug);

    if (await Bun.file(img).exists()) {
      console.log(`[found] ${img}`);
      if (!args.force) continue;

      console.log(`[delete] ${img}`);
      unlinkSync(img);
    }

    console.log(`[shot] ${url}`);
    await screenshot(url, img);

    if (args.crop) {
      let exists = false;
      while (!exists) {
        if (args.debug) console.log(".");
        await Bun.sleep(500);
        exists = await Bun.file(img).exists();
      }

      console.log(`[crop] ${img}`);
      await crop(img, args.crop);
    }
  }
}

main();
```
