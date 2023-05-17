const path = require("node:path");
const crypto = require("node:crypto");

const { glob } = require("glob");

const makeID = (data) => {
  const sha1 = crypto.createHash("sha1");
  sha1.update(path.parse(data.page.inputPath).name);
  return `tag:metaist.com,2010:blog.post-${sha1.digest("hex")}`;
};

const makePermalink = (data) => {
  const fileDate = path.basename(data.page.inputPath).substring(0, 10);
  const yearMonth = `${fileDate.substring(0, 4)}/${fileDate.substring(5, 7)}`;
  const slug = data.slug || data.page.fileSlug;
  return `/blog/${yearMonth}/${slug}.html`;
};

const findThumbnail = async (data) => {
  const search = data.page.inputPath
    .replace(/^\.\/content\/blog/, "./content/static/img")
    .replace(/\.markdown$/, ".*");

  const files = await glob(search);
  return files.length ? files[0].replace(/^content/, "") : "";
};

module.exports = {
  layout: "post.njk",
  author: "The Metaist",
  tags: ["post"],
  BLOG_URL: "/blog",
  IMG_URL: "/static/img",
  eleventyComputed: {
    id: makeID,
    permalink: makePermalink,
    thumbnail: findThumbnail,
  },
};
