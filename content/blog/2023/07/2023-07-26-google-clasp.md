---
created: "2023-07-26T21:23:07Z"
updated: "2023-07-26T21:23:07Z"
title: "Google Clasp"
tags: ["gscript", "clasp"]
description: "Very useful if you work with Google Apps Script."
---

I've been writing Google Apps Scripts for a while, but only recently discovered that Google has a command-line tool called [`clasp`](https://github.com/google/clasp).

It's a `node`-based tool and is generally pretty slow, but it makes it much easier to write code in a local IDE and then `clasp push` it to Google Drive. It has some weird semantics (i.e. it's not version controlled) and is tied to a global login. It also won't let you push anything with a syntax error in it which is similar to the web-based version.

The error messages are generally pretty good, but one thing you need to remember to do is to [enable Google Apps Script API](https://script.google.com/home/usersettings).
