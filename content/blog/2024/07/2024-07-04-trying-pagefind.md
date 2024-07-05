---
created: "2024-07-05T00:05:57Z"
updated: "2024-07-05T01:39:22Z"
title: "Trying pagefind"
tags: ["pagefind", "trace", "eleventy"]
description: "Adding a search box to the blog."
---

_Previously: [Adding a table of contents](/blog/2023/05/adding-a-toc.html), [Adventures in Eleventy](/blog/2023/05/adventures-in-eleventy.html)_

I've gotten several positive comments about how minimal this website is. But one thing that's missing is a simple search box.

In the past I've used [Google Custom Search](https://en.wikipedia.org/wiki/Google_Programmable_Search_Engine) which is now called "Google Programmable Search Engine". But this time I want to try something more in the spirit of this website: I want something static and local.

It took me so long to write down my thoughts on this that I actually solve this problem for a different website using [`pagefind`](https://pagefind.app/) which generates a static index _after_ you've built your site.

The actual changes are recorded in issue [#7](https://github.com/metaist/metaist.com/issues/7), but all it took was:

```bash
$ pnpm add --save-dev pagefind
```

```js
// eleventy.config.js
const { exec } = require("child_process");

// ...
eleventyConfig.on("eleventy.after", async () => {
  console.log(`[pagefind] building index`);
  exec(`pagefind --site ${eleventyConfig.dir.output}`);
});
// ...
```

```html
<!-- in _includes/base.njk -->
<div id="search" style="padding-top: 0.5rem;"></div>
<link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
<script src="/pagefind/pagefind-ui.js"></script>
<script>
  window.addEventListener("DOMContentLoaded", (event) => {
    new PagefindUI({ element: "#search", showSubResults: true });
  });
</script>
```
