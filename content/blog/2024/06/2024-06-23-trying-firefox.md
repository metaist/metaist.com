---
created: "2024-06-23T19:01:15Z"
updated: "2024-06-23T19:01:15Z"
title: "Trying Firefox"
tags: ["firefox", "chrome"]
---

After 15 years of using Google Chrome as my primary browser, I'm back to using Firefox. Firefox was better than Mozilla and certainly better than Internet Explorer, but it had memory leak issues which caused to slow down quite a bit. Chrome was snappy and auto-updated and it was fun to develop for.

But for the last two weeks, despite Chrome releasing several updates, I haven't been able to load Gmail in any of the non-default profiles.

So I'm trying out Firefox again. Much to my delight, the handful of extensions I use are all supported thanks to the Manifest v3 spec:

**General**

- Tab Modifier: change favicons to match URL patterns
- uBlock Origin: ad blocker

**Videos**

- SponsorBlock: skipping within YouTube
- Video Speed Controller: control video speed

**Work-related**

- Bitwarden: credential management
- Toggl Track: time tracking

I prefer Chrome's profile switching and tab groups, but thanks to **Patrick Kage**'s recommendations, I'm trying out [Sideberry](https://github.com/mbnuqw/sidebery) and setting up a custom `userChrome.css` to hide the tab bar. It's a little disconcerting to have all the tabs in the sidebar rather than up top, but I'll try it out for a few weeks to see how it goes.
