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
const crop = async (path, size = "1200x630") =>
  $`convert ${path} -gravity north -crop ${size}+0+100 +repage ${path}`;

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
