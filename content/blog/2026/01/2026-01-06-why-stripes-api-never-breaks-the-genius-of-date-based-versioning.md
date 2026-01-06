---
created: "2026-01-06T21:59:06Z"
updated: "2026-01-06T21:59:06Z"
title: "Why Stripe’s API Never Breaks: The Genius of Date-Based Versioning"
tags:
  - link
  - programming
  - Stripe
link:
  author: "Harsh Shukla"
  date: 2025-12-30
  url: https://levelup.gitconnected.com/why-stripes-api-never-breaks-the-genius-of-date-based-versioning-2c4683cf8adb
---

{% linkPost title, tags, link %} I got through most of this post before it was revealed that Stripe has a version-level description of which features were added to the API and adapters that convert inputs and outputs into the appropriate version level based on date. Very cool, but how do you handle security issues in versions? You options (as far as I can tell are):

1. Announce you can no longer use a particular version. (Breaks "we support every version".)
2. Change the behavior of the specific version and re-release with the same version number. (Breaks "this version has this particular behavior".)
3. Some kind of automatic translation that says "this published version maps to this internal version".

In any case, it's all very nice, but unlikely to impact how most people will design versioned artifacts in the future.
