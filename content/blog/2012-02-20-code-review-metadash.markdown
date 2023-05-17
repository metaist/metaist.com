---
author: The Metaist
tags: [software]
title: "Code Review: metadash"
---

_This post is based on code that was written over a weekend.
Code quality may vary._

## Summary

<div class="entry-summary" markdown="1">

A [code review][wiki-1] is a process for finding and fixing mistakes
in software often with peers. <cite>[metadash][meta-1]</cite> is a
lightweight personal dashboard that uses [browser cookies][wiki-2]
to store the list of links.

</div>

[wiki-1]: http://en.wikipedia.org/wiki/Code_review
[wiki-2]: http://en.wikipedia.org/wiki/HTTP_cookie

<figure markdown="1">

![metadash]({{thumbnail}})

<figcaption markdown="1">

  <address markdown="1">

(Image: [Metaist]({{thumbnail}}))</address>

</figcaption>
</figure><!--more-->

## Code Review

Last weekend I created a simple webpage called
<strong><cite>[metadash][meta-1]</cite></strong> that provides a list of links
that are stored in a cookie. Nothing too remarkable. But it does seem like a
good place to extract and discuss some common
[programming idioms][wiki-3] and [best practices][wiki-4].

### HTML &mdash; the skeleton

Most of my projects start off with a bit of HTML. In general,
I [follow the recommendation][ydn-1] to put styles up top right before
`</head>` and JavaScript at the end right before `</body>`. This allows
the browser layout engine to start parsing the stylesheets before the
[DOM elements][wiki-5] to which the styles apply are loaded. Similarly,
the scripts typically operate on the DOM and wait for it to load, so they
might as well be loaded closer to the end when the DOM will be ready.

So overall, the HTML looks like:

<figure markdown="1" class="code">
    <!DOCTYPE html>
    <html><head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>metadash (metaist)</title>
      <!-- stylesheets -->
    </head><body>
      <!-- content -->
      <!-- scripts -->
    </body></html>
<figcaption>
Fig 1. General HTML structure
</figcaption></figure>

1. Nowadays, I use an [HTML5][wiki-6] doctype because it's good enough for
   most browsers. If I really need the HTML5 elements, I'll also use
   [HTML5Shiv][html5-shiv] so that IE will behave.

2. It's generally a good idea to declare a `charset` for your documents.
   If you don't know anything about Unicode, [read this][joel-1].

While most `<script>` tags are fine towards the bottom of the document, some
need to run right away _before_ the DOM is loaded&mdash;like Google Analytics.

<figure markdown="1" class="code">
    <script type="text/javascript">
      var _gaq = [['_setAccount', 'UA-XXXXXXXX-X'],['_trackPageview']];
    </script>
    <script type="text/javascript" src="//www.google-analytics.com/ga.js"></script>
<figcaption markdown="1">

Fig 2. Loading [Google Analytics](http://google.com/analytics)

</figcaption></figure>

I make two improvements over the loading code Google provides:

1. Setting up the `_gaq` array directly. I do this because I know I'm not
   loading the same script more than once.

2. Loading `ga.js` using a [protocol-relative URL][rel-url] (technically
   called a "[network-path reference][rfc-3986-4.2]") which loads using either
   `HTTP` or `HTTPS` depending on how the page itself was loaded.

Google writes a whole bunch of javascript to accomplish both these things, but
I can only barely fathom the reasons why.

Other scripts that belong in `<head>` are ones that operate on stylesheets
like [LESS](http://lesscss.org/).

The main application HTML is in the middle of the `<body>`:

<figure markdown="1" class="code">
    <ul id="urls"></ul>
    <p id="no-results"><em>No URLs saved.</em></p>

    <label for="txt-url">URL:</label>
    <input id="txt-url" name="txt-url" type="text" />
    <button id="btn-add">Add</button>

<figcaption markdown="1">

Fig 3. Main view and controls

</figcaption></figure>
</figure>

### CSS &mdash; the skin

_metadash_ is not the prettiest application in the world, but I wanted to
include rearranging the list which required [jQuery UI](http://jqueryui.com/)&mdash;
which is most of the CSS.

Instead of reproducing the entire CSS here are a few interesting snippets.

<figure markdown="1" class="code">
    .btn-clear {
    	display: inline-block;
    	cursor: pointer;
    	vertical-align: middle;
    }

    .url { vertical-align: middle; }

<figcaption markdown="1">

Fig 4. Inline-block display & middle vertical alignment

</figcaption></figure>
</figure>

1. The `display: inline-block;` is possibly the best finds I've had in CSS.
   It allows `inline` elements (e.g., `<span>`, `<li>`) to behave like
   block-level elements (e.g., `<div>`) so you can set their
   `width`&mdash;without creating a new line.

2. Until recently, I feel like vertical alignment never worked the way I
   expected. (I'm still annoyed that I cannot align text vertically in a
   `<div>` without crazy incantations.)

### JavaScript &mdash; the muscles

In a [model-view-controller][wiki-7] (MVC) paradigm, the view and model
communicate via the controller. While not strictly adhering to the same
paradigm, we might say the HTML is the model/view, CSS styles the view, and
JavaScript acts like a controller. The reality is that the roles are rarely
distinct.

There's isn't much to say about JavaScript, although I did want to highlight
a pattern for creating an anonymous private scope in JavaScript (which makes
due surprisingly well without many of the common object-oriented features).

<figure markdown="1" class="code">
    (function($) {
      // anonymous, private scope
      var x = "invisible outside of this scope";
    })(jQuery);
<figcaption markdown="1">

Fig 5. Anonymous private scope in JavaScript

</figcaption></figure>
</figure>

The trick here is that the function is defined and then immediately called
without being assigned to a name (hence, anonymous). The result is that any
definitions that are exposed to the outside world are thereby invisible to
everything outside the defined scope.

### JavaScript Libraries &mdash; steroids

I make extensive use of [jQuery](http://jquery.com/) and for this project I
made use of [jQuery UI](http://jqueryui.com/) to provide sorting,
[jQuery Cookie](https://github.com/carhartl/jquery-cookie) to store
the URLs, and [URI.js](https://github.com/medialize/URI.js) to normalize
the URLs before storing them.

The result is a small little personal dashboard that is entirely cookie-based.

## See Also

- <cite>[metadash][meta-1]</cite> for the cookie-based personal dashboard;
  get the [source code here]({BASE_URL}/dash/dash.zip)
  ([MIT License](http://www.opensource.org/licenses/mit-license.php)).

- <cite>[Best Practices for Speeding Up Your Web Site][ydn-1]</cite>
  at <span class="vcard org fn">Yahoo! Developer Network</span>
  for a list of performance enhancing techniques.

- <cite>[The Absolute Minimum Every Software Developer Absolutely, Positively
  Must Know About Unicode and Character Sets (No Excuses!)][joel-1]</cite>
  at <span class="vcard org fn">Joel on Software</span> for a primer on
  Unicode.

[meta-1]: {BASE_URL}/dash/
[wiki-3]: http://en.wikipedia.org/wiki/Programming_idiom
[wiki-4]: http://en.wikipedia.org/wiki/Best_practice
[wiki-5]: http://en.wikipedia.org/wiki/Document_Object_Model
[wiki-6]: http://en.wikipedia.org/wiki/HTML5
[wiki-7]: http://en.wikipedia.org/wiki/Model_view_controller
[rfc-3986-4.2]: http://tools.ietf.org/html/rfc3986#section-4.2
[rel-url]: http://paulirish.com/2010/the-protocol-relative-url/
[html5-shiv]: https://github.com/aFarkas/html5shiv
[joel-1]: http://www.joelonsoftware.com/articles/Unicode.html
[ydn-1]: http://developer.yahoo.com/performance/rules.html
