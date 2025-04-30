---
created: "2025-04-29T17:23:35Z"
updated: "2025-04-29T17:23:37Z"
title: "castfit code review"
tags: ["castfit", "chatgpt", "gemini", "review"]
description: "Some reasonable feedback."
series: "castfit"
---

I asked both [Gemini 2.5 Pro Experimental][1] and [ChatGPT o3][2] to review the code in [`castfit` 0.1.1]. I attached the source files for `__init__.py`, the two test files, and `README.md` together with the following prompt:

> Please review the attached code and produce a comprehensive list of improvements. For any error or edge case, please produce sample code that would trigger the error/edge case. For any improvement, indicate the strength of the improvement. Improvements may include, among other things, performance, documentation, marketing, or ease-of-use.

While both found many similar issues, Gemini's output was both easier to convert to issues (although I should have been more explicit in the prompt) and it also exposed me to the great [`cattrs`](https://catt.rs/en/stable/) library which I should explore more.

I'll implement as many of these changes as I can and then see how the reviews change.

**Note**: I'm saving these transcripts to a private gist which is not indexed by search engines to try to reduce AI slop.

[`castfit` 0.1.1]: /blog/2025/04/castfit-0.1.1.html
[1]: https://gist.github.com/metaist/7691e5306a246a86b4f195075d95deec#file-2025-04-29-transcript-gemini-reviews-castfit-md
[2]: https://gist.github.com/metaist/7691e5306a246a86b4f195075d95deec#file-2025-04-29-transcript-chatgpt-reviews-castfit-md
