const less = require("less");

const markdownItAnchor = require("markdown-it-anchor");
const markdownItAttrs = require("markdown-it-attrs");
const markdownItTasks = require("markdown-it-task-lists");
const markdownItTOC = require("markdown-it-toc-done-right");

const {
  EleventyHtmlBasePlugin,
  EleventyRenderPlugin,
} = require("@11ty/eleventy");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

const pluginDrafts = require("./eleventy.config.drafts.js");
const pluginFilters = require("./eleventy.config.filters.js");
const pluginImages = require("./eleventy.config.images.js");
const pluginPagefind = require("./eleventy.config.pagefind.js");

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
module.exports = function (eleventyConfig) {
  // watch targets
  const static_glob = "content/**/*.{pdf,gif,jpeg,jpg,png,svg,webp}";
  eleventyConfig.addPassthroughCopy(static_glob);
  eleventyConfig.addWatchTarget(static_glob);

  // local plugins
  eleventyConfig.addPlugin(pluginDrafts);
  eleventyConfig.addPlugin(pluginFilters);
  eleventyConfig.addPlugin(pluginImages);
  eleventyConfig.addPlugin(pluginPagefind);

  // official plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    preAttributes: { tabindex: 0 },
  });
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.addPlugin(pluginBundle);

  // Customize Markdown library settings:
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.use(markdownItAttrs);
    mdLib.use(markdownItTasks, { label: true });
    mdLib.use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.ariaHidden({
        placement: "after",
        class: "header-anchor",
        symbol: "#",
        ariaHidden: false,
      }),
      level: [1, 2, 3, 4],
      slugify: eleventyConfig.getFilter("slugify"),
    });
    mdLib.use(markdownItTOC, { listType: "ul" });
  });

  // Old Markdown Processing
  eleventyConfig.addExtension("markdown", { key: "md" }); // add alias

  // Less Processing
  eleventyConfig.addTemplateFormats("less");
  eleventyConfig.addExtension("less", {
    outputFileExtension: "css",
    compile: async function (inputContent, inputPath) {
      return async () => {
        const result = await less.render(inputContent);
        this.addDependencies(inputPath, result.imports);
        return result.css;
      };
    },
  });

  return {
    dir: {
      input: "content",
      includes: "../_includes",
      data: "../_data",
      output: "_site",
    },
  };
};
