const cheerio = require('cheerio');
const request = require('request');

const HOURS_DIFF = 3;
const delay = 8 * 60 * 60 * 1000; // hours
let bookmakersMatchesCollection,
    isStarted,
    urlsToParse;

function parseUrl(index = 0) {
    let tournamentId = urlsToParse[index].id;
    let url = urlsToParse[index].url;
    const sport = urlsToParse[index].sport;

    request({url, 'proxy':'http://localhost:8123', agentOptions: {rejectUnauthorized: false}}, (error, response, body) => {
   // request(url, (error, response, body) => {
        console.log('Loading bookmakers matches on ' + url);

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
                    let homeTeamName = arr[0].toLowerCase().trim();
                    let guestTeamName = arr[1].toLowerCase().trim();
                    $item = $item.children('.event-header').eq(0);
                    if (!$item) {
                        return true;
                    }
                    let date = $item.find('.first.member-area').eq(0).find('.date').eq(0).text();
                    if (!date) {
                        return true;
                    }

                    // date
                    date = date.trim();
                    let time = '-';
                    let dateParts = date.split(' ');
                    if (dateParts.length === 3) {
                        let year = (new Date()).addHours(HOURS_DIFF).getFullYear();
                        let day = parseInt(dateParts[0]);
                        day = isNaN(day) ? 1 : day;
                        let month = 0;
                        switch (dateParts[1].toLowerCase().trim()) {
                            case 'янв':
                                month = 0;
                                break;
                            case 'фев':
                                month = 1;
                                break;
                            case 'мар':
                                month = 2;
                                break;
                            case 'апр':
                                month = 3;
                                break;
                            case 'мая':
                                month = 4;
                                break;
                            case 'июня':
                                month = 5;
                                break;
                            case 'июля':
                                month = 6;
                                break;
                            case 'авг':
                                month = 7;
                                break;
                            case 'сен':
                                month = 8;
                                break;
                            case 'окт':
                                month = 9;
                                break;
                            case 'ноя':
                                month = 10;
                                break;
                            case 'дек':
                                month = 11;
                                break;
                        }
                        time = dateParts[2];
                        date = new Date(year, month, day);
                    } else {
                        // today
                        time = dateParts[0];
                        date = new Date();
                        date.addHours(HOURS_DIFF);
                    }
                    date.setHours(0, 0, 0, 0);

                    // rates
                    $item = $item.find('.main-row-buttons').eq(0);
                    if (!$item) {
                        return true;
                    }

                    let rates = {};
                    for (const prop of ['1', 'x', '2', '1x', '12', 'x2', 'f1', 'f2', 'lt', 'gt']) {
                        let $next = $item.next();
                        if (!$next) {
                            return true;
                        }
                        let text = $next.text().trim();
                        if (prop === 'f1' || prop === 'f2' || prop === 'lt' || prop === 'gt') {
                            let i = text.indexOf(')');
                            let count = '-', value = '-';
                            if (i !== -1) {
                                count = parseFloat(text.substring(1, i));
                                if (isNaN(count)) {
                                    count = '-';
                                }
                                value = parseFloat(text.substring(i + 1));
                                if (isNaN(value)) {
                                    value = '-';
                                }
                            }
                            rates[prop] = {
                                count,
                                value,
                            };
                        } else {
                            rates[prop] = parseFloat(text);
                            if (isNaN(rates[prop])) {
                                rates[prop] = '-';
                            }
                        }
                        $item = $next;
                    }

                    bookmakersMatchesCollection.insertOne({
                        sport,
                        bookmakerId: 2,
                        url,
                        tournamentId,
                        homeTeamName,
                        guestTeamName,
                        date,
                        time,
                        rates,
                        createdAt: (new Date()).getTime(),
                    }).catch(() => { });
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
            setTimeout(() => parseUrl(i), 20000);
        }
    });
}

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
};

module.exports = {
    start(urls, mongoDB) {
        if (isStarted || !urls) {
            return;
        }

        isStarted = true;
        bookmakersMatchesCollection = mongoDB.collection('bookmakers_matches');
        urlsToParse = urls;

        parseUrl();
    }
};
