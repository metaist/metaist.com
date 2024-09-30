---
created: "2023-07-27T20:07:41Z"
updated: "2023-07-27T20:07:41Z"
title: "Google Drive Links: Workspace Add-on"
tags: ["gdrive", "gscript", "trace"]
series: "gdrive"
description: "My first approach to getting multiple Google Drive links."
---

_Previously_: [Problem: Google Drive Links](/blog/2023/07/google-drive-links.html)

My first approach was to create a [Google Workspace Addon](https://workspace.google.com/products/add-ons/) for Google Drive so that I could select some documents and get the links.

[Google's documentation](https://developers.google.com/workspace/add-ons/reference) is not super-helpful, so I tried asking ChatGPT which kept suggesting that I use Google Sheets to make the add on (also not helpful).

It turns out you _can_ make a sidebar for Google Drive, but it has some very particular limitations.

## Demo

<iframe width="560" height="315" class="video" src="https://www.youtube.com/embed/UjGhMYDLOS4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

- [Code](https://github.com/metaist/gdrive-links/tree/main/gscript)
- **Install** (_coming soon, hopefully_)

## `CardService` API

First, you must use the [`Card` API](https://developers.google.com/workspace/add-ons/reference/rpc/google.apps.card.v1) to build up your UI. I'm not surprised that Google has an entirely different way to build up widgets from any of the other ways there are to build up widgets, but I kept looking for a way to just use HTML. After reading [this helpful tutorial](https://kcl.hashnode.dev/managing-google-drive-with-google-apps-script), I finally figured out how to get started and later discovered Google's [Card-based interfaces](https://developers.google.com/apps-script/add-ons/concepts/card-interfaces) for a better intro. Much later, I also found [this add-ons intro](https://developers.google.com/apps-script/add-ons/cats-quickstart) that really helps clarify how to make an add-on that works in multiple contexts (I may revisit this later).

Second, you need to understand the difference between "non-contextual" (before you click on stuff) and "contextual" (after you click) modes. The entire UI is rebuilt every time something changes and it depends on whether the user has clicked on stuff or not. Because every click redraws the entire UI be careful about expensive function calls in the UI-drawing.

Third, you may use [basic HTML in some of the text widgets](https://developers.google.com/apps-script/add-ons/concepts/widgets#text_formatting). But "basic" here is more basic that I imagined:

- No `<ul>` elements.
- No `style` attributes.
- No wrapping of `<a href>` in `<font color>`.

<img alt="Inventing Anna: You look poor." src="/static/assets/inventing-anna-poor.gif" />

Finally, because the whole thing takes place in a pretty standard Google Apps Script environment, there's no access to the clipboard. I had hoped the new `ctrl+c, ctrl+v` in Google Drive would mean that there's some way to copy stuff to the clipboard, but nope. Luckily for me, you can copy the generated HTML from the sidebar and paste (the non-underlined-and-weirdly-bright, but still blue) items into Gmail.

## Home Screen

The first step is to create a [Google App Script](https://script.google.com/home).

The home screen for this sidebar will simply have some text saying to click on things:

```js
const onHomepage = () => {
  const card = CardService.newCardBuilder();
  const section = CardService.newCardSection();
  const text = CardService.newTextParagraph().setText(
    "Select some files to view links."
  );

  section.addWidget(text);
  card.addSection(section);
  return card.build();
};
```

Pretty verbose, but meh.

## Selected Items Screen

When the user selects one or more items in Google Drive, we're going to show them a list of links. Unfortunately, we're limited to using `<a>` and `<br>` tags.

```js
const getLink = (item) =>
  `<a href="${DriveApp.getFileById(item.id).getUrl()}">${item.title}</a>`;

const onDriveItemsSelected = (e) => {
  const card = CardService.newCardBuilder();
  const section = CardService.newCardSection();

  const links = e.drive.selectedItems.map(getLink);
  section.addWidget(CardService.newTextParagraph().setText(links.join("<br>")));

  card.addSection(section);
  return card.build();
};
```

## Exposing the Screens

To make these screens appear at the appropriate times, we need to update the script metadata.

Click on the `Project Settings` gear on the left-hand side and ensure `Show "appsscript.json" manifest file in editor` is enabled. We'll come back here before publishing to enable the Google Cloud Project platform.

Switch back to the `Editor` and look at `appsscript.json`:

```json
{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

Let's add the OAuth scope for reading metadata and the additional bits we need for the add-on:

```json
{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/drive.addons.metadata.readonly",
    "https://www.googleapis.com/auth/drive.readonly"
  ],
  "addOns": {
    "common": {
      "name": "Copy Links",
      "logoUrl": "https://github.com/metaist/gdrive-links/blob/main/icons/gdrive-links.png?raw=true",
      "homepageTrigger": {
        "runFunction": "onHomepage",
        "enabled": true
      }
    },
    "drive": {
      "onItemsSelectedTrigger": {
        "runFunction": "onDriveItemsSelected"
      }
    }
  }
}
```

## Google Cloud Project

In order to deploy the Workspace Add-on, you need a Google Cloud Project.

1. [Create a new Google Cloud Console project](https://console.cloud.google.com/projectcreate).
2. [Configure the OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent). Choose `External` if you want to let anyone use this add-on. The `App name`, `User support email` are required. `Logo file to upload` is recommended.
3. If you want to _publish_ this app to the Marketplace, you're going to need to provide a `Privacy Policy`, a YouTube video showing how you use the data, and a written explanation of why you need access to sensitive and/or restricted user data.
4. Manually add the OAuth scopes: `https://www.googleapis.com/auth/drive.readonly`, `https://www.googleapis.com/auth/drive.addons.metadata.readonly`, click `Add to table`, and then `Update`.
5. Add yourself as a test user and click `Add`.
6. Go to [APIs & Services](https://console.cloud.google.com/apis/dashboard).
7. Click `Enable APIs and Services`, search for `Drive`.
8. Click on `Google Drive API` and then `Enable`. If you don't do this, you'll get a cryptic error message like `Exception: We're sorry, a server error occurred. Please wait a bit and try again.` when you try to test your add-on.

## Test Deploy

1. On the Google Cloud Console upper-right hand corner, click the three dots and then `Project settings`.
2. Copy the `Project number`.
3. Go back to the Google Apps Script `Project Settings` and click `Change project` under the `Google Cloud Platform (GCP) Project` heading. Paste the project number into the box and click `Set project`. If you get any errors, follow the instructions.
4. Go to the `Editor` and click `Run` in the toolbar. In the popup, click `Review permissions`, choose your account and click `Allow`. Ignore any errors; the goal was just to give the code permission to run.
5. In the upper-right `Deploy` menu, click `Test deployments`, `Install`, and then `Done`.
6. Open a Google Drive folder and click on an item. In the sidebar, open the Copy Links and select `Authorize Access`. You should now see a link to the item you selected.

## Full Deploy

Now it's time to [publish an app](https://developers.google.com/workspace/marketplace/how-to-publish). Which then requires you to [configure your app in Google Workspace Marketplace SDK](https://developers.google.com/workspace/marketplace/enable-configure-sdk). The primary things this involves are having [Terms of Service](/terms), [Privacy Policy](/privacy), and a [video demo of the add-on](https://www.youtube.com/watch?v=UjGhMYDLOS4). I'm also going to need some kind of written description, but I'm hoping this blog post is sufficient.
