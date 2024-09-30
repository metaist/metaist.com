---
created: "2024-09-30T21:38:36Z"
updated: "2024-09-30T21:38:36Z"
title: "Google Drive Links: Thunar and Finder"
tags: ["gdrive", "thunar", "finder", "xclip", "pbcopy"]
series: "gdrive"
description: "How I added context menu items to Thunar and Finder to copy Google Drive URLs."
---

_Previously: [Google Drive Links: rclone](/blog/2024/09/google-drive-links-rclone.html)_

Now that I have a script that can take paths on the filesystem and return URLs, I want an easy way to copy those URLs to the clipboard so that I can paste them in emails.

## Generic Copy

The first step was to create a generic way of copying to the clipboard on both Linux and macOS.

```bash
#!/usr/bin/env bash
# Platform-agnostic copy HTML to the clipboard.
# See: https://askubuntu.com/a/1227729
# See: https://stackoverflow.com/a/60768487

main() {
    local html=$(cat $@)
    local utf8=$(echo "$html" | sed -e 's/<[^>]*>//g')
    if command -v xclip &>/dev/null; then # Linux
        echo "$html" | xclip -t text/html -selection clipboard
    elif command -v osascript &>/dev/null; then # MacOS
        local hexd=$(echo "$html" | hexdump -ve '1/1 "%.2x"')
        printf "set the clipboard to «data HTML${hexd}»" | osascript -
        printf "set the clipboard to ((the clipboard as record) & {«class utf8»:\"$utf8\"})" | osascript -
    fi
}

main $@
```

On Linux, we can just use `xclip`, but on macOS you actually need to use ActionScript with a hexadecimal encoding of the HTML.

## Thunar

Next, we create context menus. On Linux, I use Thunar which supports [Custom Actions](https://docs.xfce.org/xfce/thunar/custom-actions) (`Edit > Configure custom actions...`).

- Basic
  - Name: `Copy GDrive Links`
  - Command: `$HOME/bin/,gdrive-id.py --html %F | $HOME/bin/,copy-html.sh; notify-send "GDrive Links Copied (HTML)"`
- Appearance Conditions
  - File Pattern: `*`
  - Appears if selection contains: (I checked all the items)

Because it takes a few seconds to retrieve the URLs, I use `notify-send` to make a little notification letting me know that the links can be pasted.

<figure style="text-align:center">
<img src="/static/img/2024-09-30-gdrive-links-thunar.png" alt="Thunar context menu showing copying Google Drive URLs">
</figure>

## Finder

On macOS, we can use [Quick Action Workflows](https://support.apple.com/guide/automator/use-quick-action-workflows-aut73234890a/mac). You may need to [enable permissions for Finder](https://stackoverflow.com/a/65106551).

Open the `Automator` app and create a new "Quick Action".

- Workflow receives current: `files or folders` in `any application`
- Run Shell Script: `source ~/.zshrc; python $(which ,gdrive-id.py) --html $@ | $(which ,copy-html.sh)`
- Display Notification: `GDrive Links Copied (HTML)`

This creates a `.workflow` folder in `~/Library/Services` and a context menu in Finder.

<figure style="text-align:center; max-width: 100%">
<img src="/static/img/2024-09-30-gdrive-links-finder.png" alt="Finder context menu showing copying Google Drive URLs">
</figure>
