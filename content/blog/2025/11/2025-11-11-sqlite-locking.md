---
created: "2025-11-11T20:08:17Z"
updated: "2025-11-11T20:08:17Z"
title: "SQLite concurrency and why you should care about it"
tags:
  - link
  - sqlite
link:
  author: "Jean-Pierre Bachmann"
  journal: "Jellyfin"
  date: 2025-10-04
  url: https://jellyfin.org/posts/SQLite-locking/
---

{% linkPost title, tags, link %} In all the times I've gotten a SQLite locking issue, the solution has always been to retry a few times (until some other process releases the lock). But this article suggests a few other ways to solve the problem.
