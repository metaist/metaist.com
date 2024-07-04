const PLUGIN = "pagefind";

const { exec } = require("child_process");

module.exports = (eleventyConfig) => {
  eleventyConfig.on("eleventy.after", async () => {
    console.log(`[${PLUGIN}] building index`);
    exec(`pagefind --site ${eleventyConfig.dir.output}`);
  });
};
