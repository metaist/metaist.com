---
created: "2026-01-06T22:19:03Z"
updated: "2026-01-06T22:19:03Z"
title: "Speeding up bash startup"
description: "From 600ms to 14ms"
tags: ["bash", "vscode"]
series: bash
---

_Previously_: [How long do commands run?][prev]

[prev]: /blog/2024/08/command-duration.html

VSCode has had a [fancy terminal IntelliSense](https://code.visualstudio.com/docs/terminal/shell-integration#_intellisense) for some time now. For some reason, it only worked on my macOS laptop, but not on my Linux machine. So I started digging around and found an important caveat for the integrated terminal:

> Note that the script injection may not work if you have custom arguments defined in the terminal profile, have enabled `Editor: Accessibility Support`, have a complex bash `PROMPT_COMMAND`, or other unsupported setup.

Turns out that my use of `bash-preexec` messed up the `PROMPT_COMMAND` enough that VSCode couldn't inject itself properly.

Now as I described in the [previous post][prev], I'm only really using `bash-preexec` to measure the run time of commands. So I used ChatGPT 5.2 and Claude Opus 4.5 to help me work through my `.bashrc` to remove that constraint.

First, we keep track of whether we're in the prompt (we don't want to time those commands) and we separately "arm" the timer after the prompt is drawn (so we can time things after the next command runs).

```bash
# at the top
__cmd_start_us=0
__cmd_timing_armed=0
__in_prompt=0

__timer_arm() { __cmd_timing_armed=1; }
__timer_debug_trap() {
  [[ $__in_prompt -eq 1 ]] && return 0
  [[ $__cmd_timing_armed -eq 1 ]] || return 0
  __cmd_timing_armed=0
  local s=${EPOCHREALTIME%.*} u=${EPOCHREALTIME#*.}
  __cmd_start_us="${s}${u:0:6}"
}

trap '__timer_debug_trap' DEBUG
__s=${EPOCHREALTIME%.*}
__u=${EPOCHREALTIME#*.}
__cmd_start_us="${__s}${__u:0:6}"
unset __s __u

# ...

PROMPT_COMMAND="__prompt_command; __timer_arm"
```

The `trap` bit is clever and does most of the heavy lifting.

Once I got this working with my PS1 (see below), I asked Claude for any other improvements it could think of. I did this 3 times and incorporated all of its suggestions.

The main things I changed were to lazy-load completions and other imports. This brought the shell startup time down from 600ms to 14ms which I definitely notice.

```bash
__load_completions() {
  unset -f __load_completions
  if ! shopt -oq posix; then
    if [ -f /usr/share/bash-completion/bash_completion ]; then
      . /usr/share/bash-completion/bash_completion
    elif [ -f /etc/bash_completion ]; then
      . /etc/bash_completion
    fi
  fi

  # nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

  # uv
  eval "$(command uv generate-shell-completion bash)"
}
complete -D -F __load_completions # trigger on first tab-complete

# ...

# https://github.com/git/git/blob/master/contrib/completion/git-prompt.sh
__git_ps1() { unset -f __git_ps1; . ~/.git-prompt.sh; __git_ps1 "$@"; }

# ...

export NVM_DIR="$HOME/.nvm"
nvm() { unset -f nvm node npm npx; . "$NVM_DIR/nvm.sh"; nvm "$@"; }
node(){ unset -f nvm node npm npx; . "$NVM_DIR/nvm.sh"; node "$@"; }
npm() { unset -f nvm node npm npx; . "$NVM_DIR/nvm.sh"; npm "$@"; }
npx() { unset -f nvm node npm npx; . "$NVM_DIR/nvm.sh"; npx "$@"; }
```

Then there were some quality-of-life improvements:

```bash
HISTCONTROL=ignoreboth:erasedups
shopt -s histappend histverify # append and expand history file
HISTTIMEFORMAT="%F %T " # timestamp entries
HISTSIZE=10000
HISTFILESIZE=20000

# ...

shopt -s globstar  # let '**' match 0 or more files and dirs
shopt -s cdspell   # autocorrect minor typos in cd
shopt -s autocd    # type directory name to cd into it
```

The biggest of these was using [`fzf`](https://github.com/junegunn/fzf):

```bash
__fzf_lazy_init() { unset -f __fzf_lazy_init; eval "$(fzf --bash)"; }
bind '"\C-r": "\C-x1\C-r"'
bind '"\C-t": "\C-x1\C-t"'
bind '"\ec": "\C-x1\ec"'
bind -x '"\C-x1": __fzf_lazy_init'
```

This is another lazy-loaded bit, but what this gives you is a much better history search (`CTRL+R`), file search (`CTRL+T`), and better `cd` (`ALT+C`).

Here's what it looks like all together:

```bash
__cmd_start_us=0
__cmd_timing_armed=0
__in_prompt=0

__timer_arm() { __cmd_timing_armed=1; }
__timer_debug_trap() {
  [[ $__in_prompt -eq 1 ]] && return 0
  [[ $__cmd_timing_armed -eq 1 ]] || return 0
  __cmd_timing_armed=0
  local s=${EPOCHREALTIME%.*} u=${EPOCHREALTIME#*.}
  __cmd_start_us="${s}${u:0:6}"
}

trap '__timer_debug_trap' DEBUG
__s=${EPOCHREALTIME%.*}
__u=${EPOCHREALTIME#*.}
__cmd_start_us="${__s}${__u:0:6}"
unset __s __u

###

case $- in
    *i*) ;;
      *) return;;
esac

HISTCONTROL=ignoreboth:erasedups
HISTTIMEFORMAT="%F %T "  # timestamp entries
HISTSIZE=10000
HISTFILESIZE=20000
shopt -s histappend histverify # append and expand history file
shopt -s checkwinsize globstar

[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
  debian_chroot=$(cat /etc/debian_chroot)
fi

case "$TERM" in
  xterm-color|*-256color) color_prompt=yes;;
esac

if [ -n "$force_color_prompt" ]; then
  if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
	  color_prompt=yes
  else
    color_prompt=
  fi
fi

if [ "$color_prompt" = yes ]; then
  PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
  PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt

# If this is an xterm set the title to user@host:dir
case "$TERM" in
xterm*|rxvt*)
  PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\u@\h: \w\a\]$PS1"
  ;;
*)
  ;;
esac

if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias gitroot='cd $(git rev-parse --show-toplevel)'
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

# User defined

shopt -s cdspell   # autocorrect minor typos in cd
shopt -s autocd    # type directory name to cd into it

__load_completions() {
  unset -f __load_completions
  if ! shopt -oq posix; then
    if [ -f /usr/share/bash-completion/bash_completion ]; then
      . /usr/share/bash-completion/bash_completion
    elif [ -f /etc/bash_completion ]; then
      . /etc/bash_completion
    fi
  fi

  # nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

  # uv
  eval "$(command uv generate-shell-completion bash)"
}
complete -D -F __load_completions # trigger on first tab-complete


# Terminal Prompt

# From: https://github.com/metaist/brush
BR_RESET="\e[0;0m"
BR_GREEN="\e[32m"
BR_YELLOW="\e[33m"
BR_BGRED="\e[41m"

# https://github.com/git/git/blob/master/contrib/completion/git-prompt.sh
__git_ps1() { unset -f __git_ps1; . ~/.git-prompt.sh; __git_ps1 "$@"; }

VIRTUAL_ENV_DISABLE_PROMPT=true # we'll handle it ourselves
PROMPT_COMMAND="__prompt_command; __timer_arm"
__prompt_command() {
  local code="$?" # must be first
  local s=${EPOCHREALTIME%.*} u=${EPOCHREALTIME#*.}
  local now_us="${s}${u:0:6}"
  __in_prompt=1

  PS1="\[\e]0;\w\a\]\n" # set terminal title

  local venv=${VIRTUAL_ENV##*/}
  PS1+="${venv:+($venv) }" # venv name

  # add run time of previous command [error code in red]
  local dur_ms=$(( (10#$now_us - 10#$__cmd_start_us) / 1000 ))
  PS1+="${dur_ms}ms"
  if [[ "$code" != "0" ]]; then
    PS1+=" $BR_BGRED[err $code]$BR_RESET"
  fi

  PS1+="\n$BR_GREEN\u@\h$BR_RESET "   # user@host
  PS1+="$BR_YELLOW\w$BR_RESET"        # pwd
  PS1+="$(__git_ps1)"                 # git info
  PS1+="\n\$ "                        # cursor

  __in_prompt=0
}

__prepend_path() { [[ ":$PATH:" != *":$1:"* ]] && PATH="$1:$PATH"; }

# fzf
__fzf_lazy_init() { unset -f __fzf_lazy_init; eval "$(fzf --bash)"; }
bind '"\C-r": "\C-x1\C-r"'
bind '"\C-t": "\C-x1\C-t"'
bind '"\ec": "\C-x1\ec"'
bind -x '"\C-x1": __fzf_lazy_init'

# node/bun
export BUN_INSTALL="$HOME/.bun"
__prepend_path "$BUN_INSTALL/bin"

# node/pnpm
export PNPM_HOME="$HOME/.local/share/pnpm"
__prepend_path "$PNPM_HOME"

# node/nvm
export NVM_DIR="$HOME/.nvm"
nvm() { unset -f nvm node npm npx; . "$NVM_DIR/nvm.sh"; nvm "$@"; }
node(){ unset -f nvm node npm npx; . "$NVM_DIR/nvm.sh"; node "$@"; }
npm() { unset -f nvm node npm npx; . "$NVM_DIR/nvm.sh"; npm "$@"; }
npx() { unset -f nvm node npm npx; . "$NVM_DIR/nvm.sh"; npx "$@"; }

# python
export PYTHONDONTWRITEBYTECODE=1

__prepend_path "$HOME/.local/bin"
```
