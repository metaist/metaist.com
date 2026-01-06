---
created: "2024-08-30T21:22:42Z"
updated: "2024-08-30T21:22:42Z"
title: "How long do commands run?"
tags: ["bash", "uv"]
series: bash
---

One of the most remarkable things about [`uv`](https://github.com/astral-sh/uv) is just how fast it is. In fact, [Charlie Marsh] and the Astral team have been such an inspiration, that I got curious about how long commands take.

So I did the natural thing and updated my `~/.bashrc` (I'll update my `.zshrc` soon) to change my prompt to display the number of milliseconds the previous command took.

At the very top of the file, I define a variable to hold the current time in nanoseconds. Putting this here lets me know how long the `.bashrc` itself takes to run.

Then I used `preexec()` to record the start time of every command. To make this work properly, you need to download [`bash-preexec`](https://github.com/rcaloras/bash-preexec).

Finally, I used `PROMPT_COMMAND` which will get called to produce my prompt. To add a splash of color (i.e. red if the previous command failed), I used [`brush`](https://github.com/metaist/brush).

Putting it all together:

```bash
# very top of ~/.bashrc
_time_cmd=$(date +%s%N)

# <snip>

# https://github.com/metaist/brush
source ~/.local/bin/brush

preexec() { # record command start time
    _time_cmd=$(date +%s%N)
}


PROMPT_COMMAND=__prompt_command
__prompt_command() {
    local code="$?" # must be first line in this function
    PS1="\[\e]0;\w\a\]\n" # set terminal title

    # <snip>

    # add run time of previous command (in red if error)
    PS1+="$(brush reset)"
    if [[ "$code" != "0" ]]; then
        PS1+=$(brush bgRed)
    fi
    PS1+=$(( ( $(date +%s%N) - $_time_cmd ) / 1000000 ))ms
    PS1+="$(brush reset)"

    # <snip>

    PS1+="\n\$ "
}

# <snip>

# https://github.com/rcaloras/bash-preexec
source ~/.bash-preexec.sh # must be last import

# very bottom
```

[Charlie Marsh]: https://x.com/charliermarsh
