const path = require("node:path");
const crypto = require("node:crypto");

const { glob } = require("glob");

const makeID = (data) => {
  const sha1 = crypto.createHash("sha1");
  sha1.update(path.parse(data.page.inputPath).name);
  return `tag:metaist.com,2010:blog.post-${sha1.digest("hex")}`;
};

const makePermalink = (data) => {
  if (data.draft && !process.env.BUILD_DRAFTS) return false;

  const fileDate = path.basename(data.page.inputPath).substring(0, 10);
  const yearMonth = `${fileDate.substring(0, 4)}/${fileDate.substring(5, 7)}`;
  const slug = data.slug || data.page.fileSlug;
  return `/blog/${yearMonth}/${slug}.html`;
};

const findThumbnail = async (data) => {
  if (data.thumbnail) return data.thumbnail;

  const search = `./content/static/img/${path
    .basename(data.page.inputPath)
    .replace(/\.(markdown|md)$/, ".*")}`;

  const files = await glob(search);
  return files.length ? files[0].replace(/^content/, "") : "";
};

module.exports = {
  layout: "post.njk",
  author: "The Metaist",
  tags: ["post"],
  eleventyComputed: {
    id: makeID,
    permalink: makePermalink,
    thumbnail: findThumbnail,
  },
};
