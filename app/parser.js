const { spawn } = require('child_process');
const cheerio = require('cheerio');
const request = require('request');

const delay = 3 * 60 * 1000; // minutes
let matchesCollection, scheduleCollection, isStarted, urlsToParse;
let currentPhantomCount = 0;
let currentUrlIndex = 0;
const maxConcurrentlyPhantomCount = 2;

function parseUrl(url) {
    url.id = parseInt(url.id);

    let title = '';
    let proc = spawn(
        '/usr/src/app/node_modules/.bin/phantomjs',
        ['--ignore-ssl-errors=yes', '--load-images=no', '/usr/src/app/phantom.js', url.url]
    );

    console.log((new Date()).toISOString() + ' PhantomJS started (' + url.id + ')');

    proc.stdout.setEncoding('utf8');

    proc.stdout.on('data', (data) => {
        for (const dataLine of data.split("\n")) {
            if (dataLine.indexOf('http://') === 0) {
                // download page
                request(dataLine, function (error, response, body) {
                    if (error || response.statusCode !== 200) {
                        console.log('Failed download page');
                        return;
                    }

                    const $ = cheerio.load(
                        JSON.parse(body).commands.filter(obj => obj.name === 'updateContainer')[0].parameters.content
                    );

                    $('table').find('tr.match').each(function(i, elem) {
                        // skip live matches
                        if ($(this).hasClass('highlight')) {
                            return true;
                        }

                        let homeTeamId = $(this).find('.team-a').eq(0).find('a').eq(0).attr('href');
                        let pos = homeTeamId.indexOf('&id=');
                        if (pos !== -1) {
                            homeTeamId = parseInt(homeTeamId.substring(pos + 4));
                            if (isNaN(homeTeamId)) {
                                return true;
                            }
                        }
                        let homeTeamName = $(this).find('.team-a').eq(0).text().trim();
                        let guestTeamId = $(this).find('.team-b').eq(0).find('a').eq(0).attr('href');
                        pos = guestTeamId.indexOf('&id=');
                        if (pos !== -1) {
                            guestTeamId = parseInt(guestTeamId.substring(pos + 4));
                            if (isNaN(guestTeamId)) {
                                return true;
                            }
                        }
                        let guestTeamName = $(this).find('.team-b').eq(0).text().trim();
                        let date = $(this).find('.date').eq(0).text().trim();
                        date = date.split('/');
                        date = new Date(date[1] + '/' + date[0] + '/' + date[2]);

                        let score = $(this).find('.score-time').eq(0).text().trim();

                        // check match is in future
                        if (score.indexOf(':') !== -1) {
                            if (date <= (new Date()).setDate((new Date()).getDate() + 4)) {
                                scheduleCollection.insertOne({
                                    _id: `${date.getTime()};${url.id};${homeTeamId};${guestTeamId};`,
                                    tournamentId: url.id,
                                    tournamentName: title,
                                    homeTeamId,
                                    homeTeamName,
                                    guestTeamId,
                                    guestTeamName,
                                    date,
                                    time: score
                                }).catch(() => { });
                            }

                            return true;
                        }

                        score = score.split('-');
                        if (score.length !== 2) {
                            return true;
                        }

                        let homeScore = parseInt(score[0]);
                        let guestScore = parseInt(score[1]);

                        if (isNaN(homeScore) || isNaN(guestScore)) {
                            return true;
                        }

                        matchesCollection.insertOne({
                            _id: `${date.getTime()};${url.id};${homeTeamId};${homeScore};${guestTeamId};${guestScore};`,
                            tournamentId: url.id,
                            tournamentName: title,
                            homeTeamId,
                            homeTeamName,
                            homeScore,
                            guestTeamId,
                            guestTeamName,
                            guestScore,
                            date
                        }).catch(() => { });
                        scheduleCollection.remove({
                            _id: `${date.getTime()};${url.id};${homeTeamId};${guestTeamId};`
                        }).catch(() => { });
                    });
                });
            } else if (title === '') {
                title = dataLine.trim();
            }
        }
    });

    proc.on('close', () => {
        console.log((new Date()).toISOString() + ' PhantomJS exited (' + url.id + ')');
        currentPhantomCount--;
    });
}

function startBunchParsing(isFirstTime) {
    if (!isFirstTime && !currentUrlIndex) {
        setTimeout(() => { startBunchParsing(true) }, delay);
        return;
    }

    for (let length = urlsToParse.length; currentUrlIndex < length; ) {
        if (currentPhantomCount >= maxConcurrentlyPhantomCount) {
            break;
        }
        let i = currentUrlIndex;
        setTimeout(() => { parseUrl(urlsToParse[i]) }, 10);
        currentPhantomCount++;
        currentUrlIndex++;
    }

    if (urlsToParse.length === currentUrlIndex && !currentPhantomCount) {
        currentUrlIndex = 0;
    }

    setTimeout(startBunchParsing, 30000);
}

module.exports = {
    start(urls, mongoDB) {
        if (isStarted) {
            return;
        }

        isStarted = true;
        matchesCollection = mongoDB.collection('matches');
        scheduleCollection = mongoDB.collection('schedule');
        urlsToParse = urls;

        startBunchParsing(true);
    }
};
