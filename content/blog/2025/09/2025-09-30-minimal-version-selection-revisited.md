---
created: "2025-10-01T02:51:07Z"
updated: "2025-10-01T02:51:07Z"
title: "Minimal Version Selection Revisited"
tags:
  - link
  - programming
  - security
link:
  author: Alex Kladov
  date: 2024-12-24
  url: https://matklad.github.io/2024/12/24/minimal-version-selection-revisited.html
---

{% linkPost title, tags, link %}

> This is quite neat — it puts a natural damper on the supply chain attacks. If a bad version of a library is released, someone needs to explicitly opt into this new version. What’s more, the deeper in your dependency tree the library is, the more explicit approvals are required for the library to propagate to your project.
