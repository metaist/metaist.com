---
created: "2023-07-26T15:13:12Z"
updated: "2023-07-26T21:39:14Z"
title: "Problem: Google Drive Links"
tags: ["gdrive", "problem"]
---

Several times a day I need to send emails with links to Google Drive documents. However, I do not like the default "Insert File from Google Drive" formatting in Gmail and Google Docs; I just want plain links with the title of the document as the link text.

Here is my usual workflow using keyboard shortcuts:

- `ctrl + tab`: Open Gmail.
- `c`: Create a draft email.
- `ctrl + shift + 8`: Create a bulleted list, if I'm going to be sending multiple documents.
- `ctrl + tab, click`: Switch to Google Drive, click on a document.
- `n, ctrl + c, esc`: Open the "Rename" modal, copy the name, close the modal.
- `ctrl + shift + tab`: Switch back to Gmail.
- `ctrl + v`: Paste the document name.
- `ctrl + tab`: Switch back to Google Drive.
- `a, down, down, down, down, right, down, enter`: Copy the link to the document. Often I will just click the "Copy Link" button in the toolbar.
- `ctrl + shift + tab`: Switch back to Gmail.
- `ctrl + shift + left`: Select the name of the document.
- `ctrl + k, ctrl + v, enter`: Open the "Edit Link" modal, paste the link, close the modal.

And now repeat everything from the third step down for each additional document.

<img src="/static/assets/inventing-anna-no-time.gif" alt="Inventing Anna: ... I really don't have time for this!" />

For a single document, this is bad, but not terrible. When I have multiple documents, this gets very painful. In the next few posts, I'll describe various solutions I've been working on.
