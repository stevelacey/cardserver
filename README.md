Cardserver
==========

A simple social media card renderer written in PhantomJS – screenshot card-like webpages on-the-fly

Cardserver is largely based on [how Pieter generates shareable pictures](https://levels.io/phantomjs-social-media-share-pictures) for [Nomad List](https://nomadlist.com) – built for [Coworkations](https://coworkations.co)

| [![Coworkations](https://cards.coworkations.co/coworkations.png)](https://cards.coworkations.co/coworkations.png) [📄 HTML](https://coworkations.co/card) [🌇 PNG](https://cards.coworkations.co/coworkations.png) | [![Hacker Paradise: Cape Town South Africa](https://cards.coworkations.co/hacker-paradise/cape-town-south-africa.png)](https://cards.coworkations.co/hacker-paradise/cape-town-south-africa.png) [📄 HTML](https://coworkations.co/hacker-paradise/cape-town-south-africa/card) [🌄 PNG](https://cards.coworkations.co/hacker-paradise/cape-town-south-africa.png) |
| --: | --: |
| **[![Nomad Cruise VI: Spain To Greece](https://cards.coworkations.co/nomad-cruise/nomad-cruise-vi-spain-to-greece.png)](https://cards.coworkations.co/nomad-cruise/nomad-cruise-vi-spain-to-greece.png) [📄 HTML](https://coworkations.co/nomad-cruise/nomad-cruise-vi-spain-to-greece/card) [🏙 PNG](https://cards.coworkations.co/nomad-cruise/nomad-cruise-vi-spain-to-greece.png)** | **[![PACK: Ubud Bali](https://cards.coworkations.co/pack/ubud-bali-2.png)](https://cards.coworkations.co/pack/ubud-bali-2.png) [📄 HTML](https://coworkations.co/pack/ubud-bali-2/card) [🏝 PNG](https://cards.coworkations.co/pack/ubud-bali-2.png)** |


Prerequisites
-------------

- PhantomJS


Setup
-----

```sh
npm install -g phantomjs
git clone https://github.com/stevelacey/cardserver.git
phantomjs cardserver/cardserver.js
```


Usage
-----

A cardserver request maps to a webserver request like so:

| 🌇 PNG (cardserver request)                        | 📄 HTML (webserver request)                   |
| :------------------------------------------------- | :-------------------------------------------- |
| https://cards.steve.ly/steve.png                   | https://steve.ly/card                         |
| https://cards.coworkations.co/coworkations.png     | https://coworkations.co/card                  |
| https://cards.coworkations.co/hacker-paradise.png  | https://coworkations.co/hacker-paradise/card  |
| https://cards.coworkations.co/pack/ubud-bali-2.png | https://coworkations.co/pack/ubud-bali-2/card |

In short, the `cards` subdomain is stripped and the `.png` is swapped for `/card`

**Note:** homepage cards are available at `hostname(without tld).png`


Markup
------

You’ll want meta tags something like these:

```html
<meta itemprop="image" content="https://cards.coworkations.co/coworkations.png">
<meta property="og:image" content="https://cards.coworkations.co/coworkations.png">
<meta name="twitter:image" content="https://cards.coworkations.co/coworkations.png">
```


Caching
-------

Cardserver serves basic caching headers and works great with Cloudflare

The script serves a cache maxage of a week, and requires `.png` file extension so that Cloudflare will cache it without any additional configuration (page rules are required otherwise)


Debugging
---------

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)


Fonts
-----

PhantomJS can be a jerk about fonts, especially Google Fonts, you may need to download TTF’s and dump them somewhere like `/usr/share/fonts/truetype` (Ubuntu), you can get the URL to Google’s TTF’s by blanking out your `User-Agent` (otherwise it’ll probably serve you WOFF2’s)


Haproxy
-------

Haproxy is handy to push everything that hits a cards subdomain through to cardserver’s port:

```
frontend:
    default_backend app

    acl host_cards hdr_beg(host) -i cards.
    use_backend cards if host_cards

backend cards
    option forwardfor
    server cards 127.0.0.1:9100
```


Supervisor
----------

Supervisor is handy to keep cardserver running:

```
[program:cardserver]
command = phantomjs /path/to/cardserver/cardserver.js
autostart = true
autorestart = true
stdout_logfile = /var/log/supervisor/cardserver.log
stderr_logfile = /var/log/supervisor/cardserver_err.log
```
