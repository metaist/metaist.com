---
created: "2023-05-18T09:04:10Z"
updated: "2023-05-18T09:04:10Z"
title: "Adding a table of contents"
slug: "adding-a-toc"
tags: ["trace", "markdown", "eleventy"]
---

**Contents**
[[toc]]

## Goal

To easily add a table of contents for longer posts especially [traces]({{BLOG_URL}}/tag/trace/).

## Which library should I pick? {#pick-a-lib}

- So there are a lot of [table of contents `markdown-it` plugins](https://www.npmjs.com/search?q=table%20of%20contents%20markdown-it) (26 at the time of writing).

- Let's try: [`markdown-it-toc-done-right`](https://github.com/GerHobbelt/markdown-it-toc-done-right). The pitch includes security, HTML5 semantic correctness. A bit pedantic, but probably the right kind.

- Ah, looks like you should also get `markdown-it-anchor` (turns out I already did). Then I should also get `markdown-it-attrs` so I can override the heading id (might also be useful for lots of other little bits).

```bash
pnpm install --save-dev markdown-it-toc-done-right markdown-it-attrs
```

```js
// eleventy.config.js
const markdownItAttrs = require("markdown-it-attrs");
const markdownItTOC = require("markdown-it-toc-done-right");
// ...
eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.use(markdownItAttrs);
    mdLib.use(markdownItTOC, { listType: "ul" });
    // ...
};
```

Then just slap a `[[toc]]` tag in the markdown and we're good to go.
