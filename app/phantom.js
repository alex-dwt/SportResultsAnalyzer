var system = require('system');
var args = system.args;
var env = system.env;

if (args.length !== 2) {
    phantom.exit(1);
}
var url = args[1];
var SITE_URL = env['SITE_URL'];

var page = require('webpage').create();

page.onResourceRequested = function(request) {
    if (request.url.indexOf(SITE_URL + '/a/block_competition_matches') === 0) {
        console.log(request.url);
    }
};

page.open(url, function(status) {
    if(status === "success") {
        // send first page to parse
        console.log(url);

        var direction = 'next';

        console.log(page.evaluate(function() {
            var country = '';
            var el = document.getElementsByTagName('h2');
            for (var i = 0, length = el.length; i < length; i++) {
                if (el[i].innerHTML.indexOf('span') === -1) {
                    country = el[i].innerHTML;
                    break;
                }
            }

            return country + ', ' + document.title.split(' -')[0];
        }));

        var fun = function () {
            var href = page.evaluate(function(direction) {
                document.getElementsByClassName(direction)[0].click();
                return document.getElementsByClassName(direction)[0];
            }, direction);

            if (href.className.indexOf('disabled') !== -1) {
                if (direction === 'next') {
                    direction = 'previous';
                } else {
                    phantom.exit();
                }
            }

            setTimeout(fun, 5000);
        };

        fun();
    } else {
        phantom.exit(1);
    }
});