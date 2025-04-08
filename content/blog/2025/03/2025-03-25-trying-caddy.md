---
created: "2025-03-25T17:32:19Z"
updated: "2025-03-25T17:32:19Z"
title: "Trying Caddy"
tags: ["caddy", "LTS"]
description: "How quickly I've abandoned nginx + certbot."
---

I accidentally blew away my server (with several websites), so today was a good a day as any to try [`caddy`](https://caddyserver.com/).

On Ubuntu, I was able to get a server up and running quickly.

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

Then I updated `/etc/caddy/Caddyfile`:

```caddy
import *.caddy
```

And then created a bunch of `.caddy` files for each of the websites. I have three kinds of sites I support: simple static HTML sites, legacy PHP (usually WordPress), and python (uWSGI).

Static sites are super simple with Caddy:

```caddy
example.org {
	root * /var/www/example.org/site
	file_server
}
```

PHP isn't too bad either:

```caddy
example.com {
	root * /var/www/example.com/site
	php_fastcgi unix//run/php/php8.1-fpm.sock
	file_server
}
```

uWSGI took some playing around, but is even simpler once you realize that you can't use `/tmp` for security reasons and you need to use `http-socket` instead of `socket`:

```caddy
example.com {
	reverse_proxy * unix//run/uwsgi/example.sock
}
```

The only other major feature I thought I needed was URL rewriting which looked really easy. It actually took me more time to realize when I didn't need it. For example, on this blog you can get the RSS feed from `/blog/feed` which, previously, redirected to `/blog/feed/index.xml`. In Caddy you can just say:

```caddy
	file_server {
		index index.html index.xml
	}
```

The other place I rewrite is to go from `/` to `/blog/index.html` (until such day that I have a better cover page for this site). I tried a few things ChatGPT suggested like:

```caddy
  rewrite / /blog/index.html # => 404
  rewrite ^/$ /blog/index.html # => 404
```

But only it's final suggestion worked:

```caddy
	@root {
		path /
	}
	rewrite @root /blog/index.html
```

This created a named matcher `@root` that matches the exact path of `/`.

I highly recommend reading through the [concepts](https://caddyserver.com/docs/caddyfile/concepts) and skimming the list of [directives](https://caddyserver.com/docs/caddyfile/directives).

Caddy is looking like a drop-in replacement for `nginx` + `certbot`.
