---
updated: "2023-05-18T09:07:53Z"
title: "Adventures in Eleventy"
tags:
  [
    "trace",
    "eleventy",
    "blogger",
    "blogit",
    "markdown",
    "Shalev NessAiver",
    "yaml",
    "less",
  ]
---

_Previously_: [2023-05-14 Weekend Notes]({{BLOG_URL}}/2023/05/2023-05-14-weekend-notes.html)

**Contents**
[[toc]]

## Goal

To migrate my old blog posts to [`eleventy`](https://www.11ty.dev/). If that doesn't work, my next goal is to simply have a basic site with posts, tags, and RSS feed.

## Background

I started this blog in 2004 on [blogger](https://www.blogger.com/) as part of an school assignment. In 2009, I deleted all the posts and started again as a place for my thoughts. In 2011, I decided to move all my content over to my own domain and I built a backwards-compatible version of the site using PHP ([here's my post at the time]({{BLOG_URL}}/2011/09/metaist-now-with-more-metaist.html)). Then at the end of 2012, I wrote my own python static site generator called [`blogit`](https://github.com/metaist/blogit/).

Writing consistently has been difficult for me. I kept setting the bar too high. Each blog post needed a catchy thumbnail. I'd obsess and reword all the text hundreds of times and change the tags obsessively (even now I'm rewording this paragraph quite a bit). I've mitigated it a bit by having a monthly newsletter, but my public output has dropped to near-zero.

Also: `blogit` was kinda _slow_. I started thinking about ways I could cache the data to generate the website faster. But this was all dumb. I should have just used `jekyll` or `hyde` and been happy. But I was stubborn.

Fast-forward a decade and building my own static site generator seems like a poor use of my time (no matter how clever). **Shalev NessAiver** recently pointed me at [Simon Willison’s Weblog](https://simonwillison.net/) and his style of posts inspired me to try again and over this past the weekend, I discovered `eleventy` which looks like it has sensible defaults and fast build times. I'm game.

## `.markdown` vs `.md`

Usually I like shorter file extensions, but a decade ago it seems like `.markdown` was unambiguous and more popular. Nowadays `.md` is dominant and `eleventy` assumes as much. I don't mind the opinionated approach, I just have to rename the files. Ah, but in `blogit` I had made the file modification time be the post's updated time. If I rename all the files, I need to preserve the modification time.

```bash
for f in *.markdown; do
  cp -p $f # preserve times
  rm $f
done
```

**Update (Take 2)**: At first, I kept the `.markdown` file name so that I can use it as a different template format. I'll deal with the `<published>` and `<updated>` fields another time.

```js
// eleventy.config.js
const showdown = require("showdown");
// ...
module.exports = function (eleventyConfig) {
  // ...
  const showdownConverter = new showdown.Converter();
  const showdownRender = (text) => showdownConverter.makeHtml(text);

  eleventyConfig.addTemplateFormats("markdown");
  eleventyConfig.addExtension("markdown", {
    outputFileExtension: "html",
    compile: async (inputContent) => {
      const result = showdownRender(inputContent);
      return async () => result;
    },
  });
  // ...
};
```

But then, after I figured out how to fix markdown in HTML (see below), I just made `.markdown` and alias for `.md`:

```js
eleventyConfig.addExtension("markdown", { key: "md" });
```

## `YAML` front-matter

The first problem is that back when I wrote `blogit`, YAML front-matter didn't have a clear second delimiter. You could use `---` to start a new document or `...` to continue the stream. Looks like I chose wrong; everyone seems to have settled on `---`.

Fine, what if I add configuration parameters to `.eleventy.js` to change the delimiters:

```js
eleventyConfig.setFrontMatterParsingOptions({
  delims: ["---", "..."],
});
```

So that works for the old documents, but what about the new ones? Ok, forget it; I'll update all the old posts to use the `---` delimiter too.

**Update (Take 2)**: Indeed, I did end up using `---` delimiters.

## Permalinks

In `blogit`, I used `{year}/{month}/{slug}.html`, but I kinda like the `eleventy` approach of making permalinks customizable. The default is pretty sensible and abstracts away the mapping. I can just put the date in the file name if I want it there.

**Update (Take 2)**: This was fairly straightforward:

```js
// blog.11tydata.js
const path = require("node:path");

const makePermalink = (data) => {
  const fileDate = path.basename(data.page.inputPath).substring(0, 10);
  const yearMonth = `${fileDate.substring(0, 4)}/${fileDate.substring(5, 7)}`;
  const slug = data.slug || data.page.fileSlug;
  return `/blog/${yearMonth}/${slug}.html`;
};

module.exports = {
  // ...
  eleventyComputed: {
    permalink: makePermalink,
  },
};
```

## Thumbnails

In `blogit`, I had a convention of using the post file name with a `.jpg` or `.png` extension to automatically map thumbnails to posts. I actually figured out how to get this to work, kinda, but then realized that the images weren't displaying because the images were in markdown inside of a `<figure>` element (see next section).

**Update (Take 2)**: I added another pair of curly braces around `{thumbnail}` and added a computed data property:

```js
// blog.11tydata.js
const { glob } = require("glob");
// ...

const findThumbnail = async (data) => {
  const search = data.page.inputPath
    .replace(/^\.\/content\/blog/, "./content/static/img")
    .replace(/\.markdown$/, ".*");

  const files = await glob(search);
  return files.length ? files[0].replace(/^content/, "") : "";
};

module.exports = {
  // ...
  eleventyComputed: {
    thumbnail: findThumbnail,
    // ...
  },
};
```

## Markdown in HTML

Back in the day, you could put markdown inside of an HTML block and simply add `markdown="1"` to get it rendered. This was part of [PHP Markdown Extra](https://michelf.ca/projects/php-markdown/extra/#markdown-attr) and [Python-Markdown](https://python-markdown.github.io/extensions/md_in_html/). But it seems like you'd have to overwrite the default markdown parser to get this to work with a _different_ parser.

At this point I abandoned the idea of trying to port my old posts. Time to start fresh.

**Update (Take 2)**: I tried to use [`showdown`](https://showdownjs.com/) to re-render the markdown.

```js
const { EleventyRenderPlugin } = require("@11ty/eleventy");
const showdown = require("showdown");
const showdownConverter = new showdown.Converter({
  ghCompatibleHeaderId: true,
  tasklists: true,
});

const showdownRender = (text) => showdownConverter.makeHtml(text);

eleventyConfig.addTemplateFormats("markdown");
eleventyConfig.addExtension("markdown", {
  outputFileExtension: "html",
  compile: async function (inputContent, inputPath) {
    return async (data) => {
      const njk = await EleventyRenderPlugin.String(inputContent, "njk");
      const njk_rendered = await njk(data);

      const md = await EleventyRenderPlugin.String(njk_rendered, "md");
      const md_rendered = await md(data);
      const result = showdownRender(md_rendered);
      console.log(`[showdown] rendered ${inputPath}`);
      return result;
    };
  },
});
```

But the actual solution was simpler: [add a blank line after the opening tag](https://spec.commonmark.org/0.30/#example-188) and use the existing parser.

## RSS

Surprise! The [out-of-the-box example of using the RSS plugin](https://www.11ty.dev/docs/plugins/rss/) didn't work. But it seemed so simple! I'll come back to it later.

**Update (Take 2)**: I got this to work and was able to preserve all the old `<id>` tags:

```js
// blog.11tydata.js
const path = require("node:path");
const crypto = require("node:crypto");
// ...

const makeID = (data) => {
  const sha1 = crypto.createHash("sha1");
  sha1.update(path.parse(data.page.inputPath).name);
  return `tag:metaist.com,2010:blog.post-${sha1.digest("hex")}`;
};
// ...

module.exports = {
  // ...
  eleventyComputed: {
    id: makeID,
    // ...
  },
};
```

## LESS

[`less`](https://lesscss.org/) is still my favorite way to write CSS even after all these years. So I figure I could adapt the [SASS example](https://www.11ty.dev/docs/languages/custom/#example-add-sass-support-to-eleventy) to use `less`:

```js
// eleventy.config.js
const less = require("less");
// ...
module.exports = function (eleventyConfig) {
  // ...
  eleventyConfig.addTemplateFormats("less");
  eleventyConfig.addExtension("less", {
    outputFileExtension: "css",
    compile: async function (inputContent) {
      return async (data) => {
        const result = await less.render(inputContent);
        return result.css;
      };
    },
  });
};
```

This actually kinda worked except that `eleventy --serve` only noticed the change in the `.less` files, but didn't re-render them unless I touched the `.eleventy.js` file itself.

Of course this just means I need to follow the "[Registering Dependencies](https://www.11ty.dev/docs/languages/custom/#registering-dependencies)" section. Should work easily, right? Not quite. This will probably do the right thing if URLs _within_ a `.less` file change. Meh, will deal with this later.

**Update**: Turns out restarting `eleventy` fixed this and now changes to the `.less` file automatically re-render the page. Wonderful!

## Highlighting?

Bit of a reach, but could I [add some basic highlighting](https://www.11ty.dev/docs/plugins/syntaxhighlight/)? Worked correctly the first time. Impressive.

## Using a Starter Repo

So when I decided to start from scratch, I should have actually started from [eleventy-base-blog](https://github.com/11ty/eleventy-base-blog).

- Let's start with the blog [metadata](https://github.com/11ty/eleventy-base-blog/blob/main/_data/metadata.js). Now that I know how how the [data cascade](https://www.11ty.dev/docs/data-cascade/) works, this all makes sense.

- Let's move on to the [templates](https://github.com/11ty/eleventy-base-blog/tree/main/_includes). Looks like there's a little helper for [lists of posts](https://github.com/11ty/eleventy-base-blog/blob/main/_includes/postslist.njk). Might come back to this later.

- The [base template](https://github.com/11ty/eleventy-base-blog/blob/main/_includes/layouts/base.njk) looks nice. Let's crib from here.

  - **Q**: How important is it to use the `.njk` rather than the default `liquid` template language?

    - **Update 1**: I need to change `set` to `capture`; remove `| safe` for content, since it's already escaped; and convert `var1 or var2` expressions to `var1 | default: var2`.
    - **Update 2**: See below, when I change it all back.

  - [Looks like I'll need to get the RSS plugin working correctly](https://github.com/11ty/eleventy-base-blog/blob/b85269b1aa2859c1043b79c338079835fa57fb94/_includes/layouts/base.njk#L10).
  - [So that's how they do bundling](https://github.com/11ty/eleventy-base-blog/blob/b85269b1aa2859c1043b79c338079835fa57fb94/_includes/layouts/base.njk#L16). Not sure what I make of the claim that "Inlined CSS" has the "fastest site performance in production". I'll hold off on this for the moment.
  - The [navigation code](https://github.com/11ty/eleventy-base-blog/blob/b85269b1aa2859c1043b79c338079835fa57fb94/_includes/layouts/base.njk#L42) took me a second to process. I had to noticed that `collections.all` (every page on the site) was being piped through an `eleventyNavigation` filter. This seems... _wasteful_? But maybe it's super fast? I'll need to remember to add the navigation plugin.

- Updating the templates breaks things, so I'm going to jump to the [plugins and get that setup](https://github.com/11ty/eleventy-base-blog/blob/b85269b1aa2859c1043b79c338079835fa57fb94/eleventy.config.js). I'm surprised they're using `eleventy.config.js` instead of `.eleventy.js`. Not sure it makes a difference. Gonna need a bunch of packages.

```bash
pnpm install --save-dev \
  luxon markdown-it-anchor \
  @11ty/eleventy-plugin-rss \
  @11ty/eleventy-plugin-syntaxhighlight \
  @11ty/eleventy-plugin-bundle \
  @11ty/eleventy-navigation \
  @11ty/eleventy-img
```

- Ah, and I'll get to learn [how to make custom plugins](https://github.com/11ty/eleventy-base-blog/blob/b85269b1aa2859c1043b79c338079835fa57fb94/eleventy.config.js#L10).

- Oh, you can [add your own watch targets](https://github.com/11ty/eleventy-base-blog/blob/b85269b1aa2859c1043b79c338079835fa57fb94/eleventy.config.js#L21). Very slick.

- I'm not going to include [these changes to the defaults](https://github.com/11ty/eleventy-base-blog/blob/b85269b1aa2859c1043b79c338079835fa57fb94/eleventy.config.js#L103).

  - **Update**: I did end up including some of these.

- So my styles are all messed up, so maybe I'll focus on [how they do styles next](https://github.com/11ty/eleventy-base-blog/blob/b85269b1aa2859c1043b79c338079835fa57fb94/public/css/index.css). I'll need to work on the dark mode stuff later.

- Ah, I see the benefit of [moving things into a `content` folder](https://github.com/11ty/eleventy-base-blog/tree/b85269b1aa2859c1043b79c338079835fa57fb94/content). It doesn't pollute your top-level with unexpected bits.

- Just discovered that [`nunjucks` is essentially a port of `jinja2`](https://mozilla.github.io/nunjucks/templating.html). I already know and like using `jinja2`, so I'm going to switch everything over.

## Migration Take 2

Now that I managed to get a basic thing working, let me try, one more time to port my old blog.

- **Tasks**
- [x] YAML front-matter
- [ ] permalinks
  - [x] `/blog/index.html` (blog home)
  - [x] `/blog/{year}/{month}/{slug}.html` (post)
  - [x] `/blog/archive/index.html` (all posts)
  - [x] `/blog/feed/index.xml`
  - [x] `/blog/tag` (all tags)
  - [x] `/blog/tag/{slug}.html` (posts by tag)
  - [ ] `/blog/{year}/index.html` (posts by year)
  - [ ] `/blog/{year}/{month}/index.html` (posts by year + month)
- [x] heading links
- [x] `{thumbnail}`
- [x] `{BASE_URL}`
- [x] `{BLOG_URL}`
- [x] `{IMG_URL}`
- [x] `{video}`
- [x] markdown in html
- [x] LESS
- [x] syntax highlighting
- [ ] `hentry` microformat (not sure this was used)
- [x] RSS
  - [x] `id` (should be a metadata field)
  - [x] `<published>` and `<updated>` should use post metadata with a backup to the file
- **Wish List**
- [ ] dark mode
- [ ] mobile view

## Updates

### 2023-05-18

- [I added table of contents support]({{BLOG_URL}}/2023/05/adding-a-toc.html).
