#!/usr/bin/env phantomjs
var fs = require('fs'),
    server = require('webserver').create(),
    system = require('system'),
    dir = '/tmp/cards',
    port = system.env.PORT || 9100,
    width = 1024,
    height = 512,
    maxage = 60 * 60 * 24 * 7,
    regex = /^(?:\/cards)?\/([\w/-]+)\.png(?:\?.*)?$/;

if (!fs.exists(dir)) fs.makeDirectory(dir);

var service = server.listen(port, function (request, response) {
    var base, host, path, tmp, url;

    if (!request.url.match(regex)) {
        response.statusCode = 404;
        response.write('');
        response.close();
        return;
    }

    host = request.headers['Host'].replace('cards.', '').replace(/:.*/, '');
    base = host.substr(0, host.indexOf('.'));
    path = request.url.replace(regex, '$1');

    if (path == base) {
        url = 'https://' + host + '/card';
    } else {
        url = 'https://' + host + '/' + path + '/card';
    }

    tmp = dir + '/' + path + '.png';

    console.log(url);

    page(url, function (status) {
        if (status !== 'success'){
            console.log('url: ' + this.reason_url + 'reason: ' + this.reason);
        }

        response.statusCode = this.resources[0].status;

        if (response.statusCode == 200) {
            this.render(tmp);

            var image = fs.open(tmp, 'rb');
            var data = image.read();
            image.close();

            response.headers = {
                'Cache-Control': 'public, max-age=' + maxage,
                'Content-Length': data.length,
                'Content-Type': 'image/png',
                'Expires': new Date(Date.now() + maxage * 1000).toUTCString(),
            };
            response.setEncoding('binary');
            response.write(data);
        } else {
            response.write('');
        }

        response.close();
        this.close();
    });
});

function page(url, cb) {
    var page = require('webpage').create();

    page.clipRect = {top: 0, left: 0, width: width, height: height};
    page.paperSize = {width: width + 'px', height: height + 'px', border: '0px'};
    page.viewportSize = {width: width, height: height};
    page.resources = [];

    page.onResourceReceived = function (response) {
        // check if the resource is done downloading
        if (response.stage !== 'end') return;

        // add to page.resources if is text/html
        if (response.headers.filter(function (header) {
            if (header.name == 'Content-Type' && header.value.indexOf('text/html') == 0) {
                return true;
            }
            return false;
        }).length > 0) {
            page.resources.push(response);
        }
    };

    return page.open(url, cb);
}

if (service) {
    console.log('Card server started on port ' + server.port);
} else {
    console.log('Error starting card server on port ' + server.port);
}
