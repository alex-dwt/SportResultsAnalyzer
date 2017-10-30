const cheerio = require('cheerio');
const request = require('request');

const delay = 3 * 60 * 1000; // minutes
let bookmakersMatches,
    isStarted,
    urlsToParse;

function parseUrl(index = 0) {
    let url = urlsToParse[index];

    request(url.url, (error, response, body) => {
        console.log('Loading bookmakers matches on ' + url.url);

        if (!error && response.statusCode === 200) {
            const $ = cheerio.load(body);
            let $table = $('table.foot-market');
            if ($table.length === 1) {
                $table.children().each(function(i, elem) {
                    let $item = $(this);
                    let teams = $item.data('eventName');
                    if (!teams) {
                        return true;
                    }
                    let arr = teams.split(' - ');
                    if (arr.length !== 2) {
                        return true;
                    }
                    let homeTeamName = trim(arr[0].toLowerCase());
                    let guestTeamName = trim(arr[1].toLowerCase());
                    $item = $item.children('.event-header').eq(0);
                    if (!$item) {
                        return true;
                    }
                    let date = $item.find('.first.member-area').eq(0).find('.date').eq(0).text();
                    if (!date) {
                        return true;
                    }
                    date = trim(date);
                    $item = $item.find('.main-row-buttons').eq(0);
                    if (!$item) {
                        return true;
                    }

                    let rates = {};
                    for (const prop of ['1', 'x', '2', '1x', '12', 'x2', 'f1', 'f2']) {
                        let $next = $item.next();
                        if (!$next) {
                            return true;
                        }
                        let text = trim($next.text());
                        if (prop === 'f1' || prop === 'f2') {
                            let i = text.indexOf(')');
                            let count = '-', value = '-';
                            if (i !== -1) {
                                count = text.substring(1, i);
                                value = parseFloat(text.substring(i + 1));
                            }
                            rates[prop] = {
                                count,
                                value,
                            };
                        } else {
                            rates[prop] = parseFloat(text);
                        }
                        $item = $next;
                    }

                    console.log({
                        bookmakerId: 2,
                        homeTeamName,
                        guestTeamName,
                        date,
                        rates
                    })

                });
            } else {
                console.log($table.length + ' - skip!');
            }
        } else {
            console.log('Failed download page');
        }

        if (++index === urlsToParse.length) {
            // again
            setTimeout(() => parseUrl(), delay);
        } else {
            let i = index;
            setTimeout(() => parseUrl(i), 2000);
        }
    });
}

function trim(string) {
    return string.replace(/^\s*|\s*$/g, '');
}

module.exports = {
    start(urls, mongoDB) {
        if (isStarted || !urls) {
            return;
        }

        isStarted = true;
        bookmakersMatches = mongoDB.collection('bookmakers_matches');
        urlsToParse = urls;

        parseUrl();
    }
};
