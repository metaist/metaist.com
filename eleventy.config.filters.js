const fs = require("node:fs");
const { DateTime } = require("luxon");

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
module.exports = (eleventyConfig) => {
  const slugify = eleventyConfig.getFilter("slugify");
  const isString = (value) => typeof value === "string";
  const isDate = (date) =>
    Object.prototype.toString.call(date) === "[object Date]";

  // Filters
  const readableDate = (dateObj, format, zone) => {
    // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    if (typeof dateObj === "string" || dateObj instanceof String) {
      dateObj = new Date(dateObj);
    }

    return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(
      format || "dd LLLL yyyy"
    );
  };
  eleventyConfig.addFilter("readableDate", readableDate);

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) return [];
    if (n < 0) return array.slice(n);
    return array.slice(0, n);
  });

  // Sort array by a date field.
  eleventyConfig.addFilter("sortByDate", (array, field = "created") => {
    if (!Array.isArray(array) || array.length === 0) return [];
    return array.sort(
      (a, b) => (a.data[field] || a.page.date) - (b.data[field] || b.data.date)
    );
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  // Return all the tags used in a collection
  eleventyConfig.addFilter("getAllTags", (collection) => {
    let tagSet = new Set();
    for (let item of collection) {
      (item.data.tags || []).forEach((tag) => tagSet.add(tag));
    }
    return Array.from(tagSet);
  });

  eleventyConfig.addFilter("filterTagList", (tags) => {
    return (tags || []).filter(
      (tag) => !["all", "nav", "post", "posts"].includes(tag)
    );
  });

  eleventyConfig.addFilter("fileExists", (filename) => fs.existsSync(filename));
  eleventyConfig.addFilter("units", (num, singular, plural) => {
    return `${num.toLocaleString("en-US")} ${
      num === 1 ? singular : plural || singular + "s"
    }`;
  });

  const emojiTags = {
    book: "📖",
    paper: "📄",
    podcast: "🎙️",
    tweet: "🐦",
    bluesky: "🦋",
    video: "▶️",
    article: "📝", // generic
    link: "📝", // generic
  };

  const emojiTag = (tags) => {
    for (const [s, u] of Object.entries(emojiTags)) {
      if (tags.includes(s)) return u;
    }
    return "";
  };
  eleventyConfig.addShortcode("emojiTag", emojiTag);

  const citeAuthorJournal = (link) => {
    details = [];
    if (link.author) details.push(link.author);
    if (link.journal) details.push(link.journal);
    return details.length ? details.join(" / ") : "";
  };

  const citeDateVia = (link, start = "") => {
    details = [];
    if (start) details.push(start);
    if (link.date && link.tags.includes("book")) {
      if (isDate(link.date)) {
        details.push(readableDate(link.date, "yyyy"));
      } else details.push(link.date);
    }
    if (link.via) {
      let via = "via";
      if (isString(link.via) && link.via.startsWith("http"))
        link.via = { url: link.via };
      if (link.via.name) via = link.via.name;
      if (link.via.known) {
        via = `**${via}**`;
        // if (!link.via.url)
        //   link.via.url = `/blog/tag/${slugify(link.via.name)}/`;
      }
      if (link.via.url) via = `[${via}](${link.via.url})`;
      if (!link.via.name && !link.via.url) via = link.via;

      details.push(`via ${via}`);
    }
    return details.length ? ` (${details.join("; ")})` : "";
  };

  eleventyConfig.addShortcode("linkPost", (title, tags, link) => {
    link.title = title;
    link.tags = tags;
    const emoji = emojiTag(tags);
    let result = `${emoji} [${title}](${link.url})`;
    if (link.author) {
      if (tags.includes("book") || tags.includes("paper"))
        result += ` by ${link.author}${citeDateVia(link)}`;
      else result += citeDateVia(link, citeAuthorJournal(link));
    } else result += citeDateVia(link);
    if (link.author || link.date || link.via) result += ".";
    return result;
  });

  eleventyConfig.addFilter(
    "tagify",
    (tag) => `[${tag}](/blog/tag/${slugify(tag)}/)`
  );
};
