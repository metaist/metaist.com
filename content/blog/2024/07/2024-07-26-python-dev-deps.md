---
created: "2024-07-26T21:15:14Z"
updated: "2024-07-26T21:15:14Z"
title: "Stop Hiding Python Dev Dependencies"
tags: ["python", "pdm", "poetry"]
description: "The most popular python tools each have a different place to put dev dependencies. I think they should just be optional."
---

Both [PEP 621](https://peps.python.org/pep-0621/) and the newer [`pyproject.toml` Specification](https://packaging.python.org/en/latest/specifications/pyproject-toml/) describe how a Python project should specify it's `dependencies` which are required to run the project. They also describe `optional-dependencies` which are "extra" to the project and can be added for additional features. Groups of `optional-dependencies` are grouped under a common name.

There's another class of dependencies that are not discussed in the aforementioned standards and these are known as `dev-dependencies`: those packages which you need during _development_ of the project, but not to _use_ the project itself.

This is probably a flaw in the specification; compare that with [`package.json` which has `devDependencies`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#devdependencies) and therefore the tools in the `node` ecosystem know where to put packages you add with `--save-dev`.

I generally concur with [this comment about dependencies](https://www.reddit.com/r/Frontend/comments/fhgdd8/comment/fkbbtd7/):

> Why am I pointing this out? Because adding an actual dependency to my code is something I take very seriously. Importing lodash or react or whatever is a serious decision that I feel should be taken with extreme caution. Dependencies can lead to bloated code, exploits and bugs that are out of your control. If everything is on "devDependencies" or "dependencies", it's really hard to see how many of these dangerous imports a project has.
>
> I tend to make it a personal goal to have as few dependencies as possible, but I couldn't care less for devDependencies.

I also make it a personal goal to reduce the number of dependencies my projects use. But I _also_ care about my dev dependencies. These are the tools that make my projects possible and I care if they're slow or fast or have security issues. I take adding new dev dependencies seriously because it's overhead for anyone who wants to be so kind to work on my projects (usually some future version of myself). But I agree that it's a little bit different than a core dependency.

Back to Python. Because `dev-dependencies` are not part of the `pyproject.toml` specification, popular tools like `pdm` and `poetry` need to specify custom configuration to store this metadata.

But why? We could just treat `dev-dependencies` as `optional-dependencies` with the convention of calling the group `dev` ([example](https://github.com/metaist/ds/blob/5ef9c44fc05542dad2b599d2bb100f8f4b144519/pyproject.toml#L39)). Then you'd be able to install them like:

```bash
python -m pip install pkg[dev]

# or, if you use uv
uv pip install pkg[dev]
```

In [this lengthy discussion on `pdm`](https://github.com/pdm-project/pdm/discussions/304), people seem to be worried about having the dev metadata published on PyPI. But again why? Are you worried Dependabot is going to tell you about security vulnerabilities in your dev dependencies? (Wait, that's a good thing.) Are you worried people will think your project is bloated? (They'd have to install your package with `[dev]` to notice.)

Sure it would have probably been better for `pyproject.toml` to have defined a `dev-dependencies` section. But until it's defined, why not use the standard mechanism for optional dependencies to define dev dependencies?

I can be convinced otherwise, but my current policy is to put dev dependencies in `project.optional-dependencies.dev`.

**Update** (2024-07-29): Thanks to **Shalev NessAiver** who suggested a much better title for this article.
