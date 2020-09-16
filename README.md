Cardserver
==========

A simple social media card renderer written in PhantomJS – screenshot card-like webpages on-the-fly

Cardserver is largely based on [how Pieter generates shareable pictures](https://levels.io/phantomjs-social-media-share-pictures) for [Nomad List](https://nomadlist.com) – built for [Coworkations](https://coworkations.com)

| [![Coworkations](https://coworkations.com/cards/coworkations.png)](https://coworkations.com/cards/coworkations.png) [📄 HTML](https://coworkations.com/card) [🌇 PNG](https://coworkations.com/cards/coworkations.png) | [![Hacker Paradise: Cape Town South Africa](https://coworkations.com/cards/hacker-paradise/cape-town-south-africa.png)](https://coworkations.com/cards/hacker-paradise/cape-town-south-africa.png) [📄 HTML](https://coworkations.com/hacker-paradise/cape-town-south-africa/card) [🌄 PNG](https://coworkations.com/cards/hacker-paradise/cape-town-south-africa.png) |
| --: | --: |
| **[![Nomad Cruise VI: Spain To Greece](https://coworkations.com/cards/nomad-cruise/nomad-cruise-vi-spain-to-greece.png)](https://coworkations.com/cards/nomad-cruise/nomad-cruise-vi-spain-to-greece.png) [📄 HTML](https://coworkations.com/nomad-cruise/nomad-cruise-vi-spain-to-greece/card) [🏙 PNG](https://coworkations.com/cards/nomad-cruise/nomad-cruise-vi-spain-to-greece.png)** | **[![PACK: Ubud Bali](https://coworkations.com/cards/pack/ubud-bali-2.png)](https://coworkations.com/cards/pack/ubud-bali-2.png) [📄 HTML](https://coworkations.com/pack/ubud-bali-2/card) [🏝 PNG](https://coworkations.com/cards/pack/ubud-bali-2.png)** |


Setup
-----

```sh
npm install -g cardserver
cardserver
```


Usage
-----

A cardserver request maps to a webserver request like so:

| 🌇 PNG (cardserver request) | 📄 HTML (webserver request) |
| :-------------------------------------------------- | :--------------------------------------------- |
| https://steve.ly/cards/steve.png                    | https://steve.ly/card                          |
| https://coworkations.com/cards/coworkations.png     | https://coworkations.com/card                  |
| https://coworkations.com/cards/hacker-paradise.png  | https://coworkations.com/hacker-paradise/card  |
| https://coworkations.com/cards/pack/ubud-bali-2.png | https://coworkations.com/pack/ubud-bali-2/card |

In short, the `/cards` prefix is dropped and the `.png` is swapped for `/card`

**Note:** homepage cards are available at `hostname(without tld).png`


Markup
------

You’ll want meta tags something like these:

```html
<meta itemprop="image" content="https://coworkations.com/cards/coworkations.png">
<meta property="og:image" content="https://coworkations.com/cards/coworkations.png">
<meta name="twitter:image" content="https://coworkations.com/cards/coworkations.png">
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


NGINX
-----

The simplest way to hook cardserver up is to map `/cards` to it via NGINX:

```
location /cards {
    proxy_pass http://127.0.0.1:9100;
}
```


Haproxy
-------

Alternatively, cardserver can work with a subdomain, and you could serve it with haproxy like so:

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
command = cardserver
autostart = true
autorestart = true
stdout_logfile = /var/log/supervisor/cardserver.log
redirect_stderr = true
```
