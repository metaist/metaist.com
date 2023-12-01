---
created: "2023-09-06T22:04:15Z"
updated: "2023-09-06T22:04:15Z"
title: "Why I prefer pnpm over npm"
tags: ["LTS", "principle", "pnpm", "npm", "yarn", "black", "pylint", "pipenv"]
description: "An explanation of my current preference of pnpm over npm."
---

Yesterday I had a conversation with **Joe Hostyk** who pointed out that I hadn't been publishing blog posts in the quick-and-dirty-throwaway manner I had suggested I would be doing. The barrier for publishing had been creeping up again and I didn't publish anything in August at all.

Part of my reluctance to publish is I don't want to start flame wars, but I do want a public record of my preferences so that I can compile them into guidance for my team.

So below are some of my reasons for why I like [`pnpm`](https://pnpm.io/) more than [`npm`](https://www.npmjs.com/):

1. **It's fast.** `npm` has gotten a lot faster in recent years, but `pnpm` still feels snappier. Speed is a huge factor in the way I pick tools, especially tools that I use very frequently. It's why I tried out [`yarn`](https://yarnpkg.com/) when it first came out. Although there are other stronger reasons, speed is one reason I prefer [`black`](https://github.com/psf/black) over [`pylint`](https://github.com/pylint-dev/pylint).

2. **It makes it easy to run scripts.** Even though I still need to get used to typing that first `p`, I like `pnpm dev` much more than `npm run dev`.

3. **It resolves packages properly.** Not sure why `npm` has such a hard time resolving packages. It's not as bad as [`pipenv`](https://pipenv.pypa.io/en/latest/), but still occasionally gets stuck. (This was the other reason I tried `yarn`.)

4. **It's hard to import something you didn't install.** This is one of the gotchas of `node_modules` with `npm`: if your dependency has a dependency, you can reference it even though it's not your direct dependency. Depending on something implicitly is asking for trouble.

Eventually, I should compile all these principles somewhere where I track my current set of preferred tools.
