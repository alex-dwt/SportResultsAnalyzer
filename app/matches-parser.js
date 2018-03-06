/*
 * This file is part of the SportResultsAnalyzer package.
 * (c) Alexander Lukashevich <aleksandr.dwt@gmail.com>
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

const { spawn } = require('child_process');
const cheerio = require('cheerio');
const request = require('request');
const db = require("./db");
const URLS = require("./sites");


const SPORT_TYPE_BASKETBALL = 'basketball';
const HOURS_DIFF = 2;
const delay = 3 * 60 * 1000; // minutes
let matchesCollection,
    scheduleCollection,
    archiveCompletedCollection,
    urlsToParse = [];
let currentPhantomCount = 0;
let currentUrlIndex = 0;
const maxConcurrentlyPhantomCount = 2;

function parseUrl(url) {
    const isArchived = !! url.isArchive;
    const sport = url.sport;
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
                        dataLine === url.url
                            ? body
                            : JSON.parse(body).commands.filter(obj => obj.name === 'updateContainer')[0].parameters.content
                    );

                    $('table.matches').find('tr.match').each(function(i, elem) {
                        let $this = $(this);

                        // skip live matches
                        if ($this.hasClass('highlight')) {
                            return true;
                        }

                        let homeTeamId = $this.find('.team-a').eq(0).find('a').eq(0).attr('href');
                        let pos = homeTeamId.indexOf('&id=');
                        if (pos !== -1) {
                            homeTeamId = parseInt(homeTeamId.substring(pos + 4));
                            if (isNaN(homeTeamId)) {
                                return true;
                            }
                        }
                        let homeTeamName = $this.find('.team-a').eq(0).text().trim();
                        let guestTeamId = $this.find('.team-b').eq(0).find('a').eq(0).attr('href');
                        pos = guestTeamId.indexOf('&id=');
                        if (pos !== -1) {
                            guestTeamId = parseInt(guestTeamId.substring(pos + 4));
                            if (isNaN(guestTeamId)) {
                                return true;
                            }
                        }
                        let guestTeamName = $this.find('.team-b').eq(0).text().trim();
                        let date = $this.find('.date').eq(0).text().trim();
                        date = date.split('/');
                        date = new Date(date[1] + '/' + date[0] + '/' + date[2]);
                        date.setHours(0, 0, 0, 0);

                        let scoreLine = $this.find('.score-time').eq(0);
                        let score = scoreLine.find('.scoring');

                        // check match is in future
                        if (!score.length) {
                            if (isArchived) {
                                return true;
                            }

                            // correct date
                            let time = scoreLine.text().trim().split(':');
                            if (time.length !== 2) {
                                return true;
                            }
                            date.setHours(time[0].trim(), time[1].trim(), 0, 0);
                            date.addHours(HOURS_DIFF);
                            time = `${date.getHours()}:${time[1].trim()}`;
                            date.setHours(0, 0, 0, 0);

                            if (date <= (new Date()).setDate((new Date()).getDate() + 4)) {
                                scheduleCollection.insertOne({
                                    _id: `${sport};${date.getTime()};${url.id};${homeTeamId};${guestTeamId};`,
                                    sport,
                                    tournamentId: url.id,
                                    tournamentName: `${title} (${url.id})`,
                                    homeTeamId,
                                    homeTeamName,
                                    guestTeamId,
                                    guestTeamName,
                                    date,
                                    time,
                                }).catch(() => { });
                            }

                            return true;
                        }

                        score = score.text().trim().split('-');
                        if (score.length !== 2) {
                            return true;
                        }

                        let homeScore = parseInt(score[0]);
                        let guestScore = parseInt(score[1]);

                        if (isNaN(homeScore) || isNaN(guestScore)) {
                            return true;
                        }

                        let item = {
                            _id: `${sport};${date.getTime()};${url.id};${homeTeamId};${homeScore};${guestTeamId};${guestScore};${+ isArchived};`,
                            sport,
                            tournamentId: (isArchived ? 'a' : '') + url.id,
                            tournamentName: `${title} (${url.id})`,
                            homeTeamId,
                            homeTeamName,
                            homeScore,
                            guestTeamId,
                            guestTeamName,
                            guestScore,
                            date,
                            isArchived,
                            totalScore: homeScore + guestScore,
                        };
                        if (sport === SPORT_TYPE_BASKETBALL) {
                            item = {...item, overtime: !! scoreLine.find('.score-addition').length};
                        }
                        matchesCollection.insertOne(item).catch(() => { });

                        if (!isArchived) {
                            scheduleCollection.remove({
                                _id: `${sport};${date.getTime()};${url.id};${homeTeamId};${guestTeamId};`
                            }).catch(() => { });
                        }
                    });
                });
            } else if (title === '') {
                title = dataLine.trim();
            }
        }
    });

    proc.on('close', () => {
        if (isArchived) {
            archiveCompletedCollection.insertOne({
                _id: `${url.sport};${url.id}`,
            }).catch(() => { });
        }

        console.log((new Date()).toISOString() + ' PhantomJS exited (' + url.id + ')');
        currentPhantomCount--;
    });
}

async function startBunchParsing(isFirstTime) {
    if (!isFirstTime && !currentUrlIndex) {
        setTimeout(() => { startBunchParsing(true) }, delay);
        return;
    }

    for (let length = urlsToParse.length; currentUrlIndex < length; ) {
        if (currentPhantomCount >= maxConcurrentlyPhantomCount) {
            break;
        }
        let i = currentUrlIndex;

        if ((urlsToParse[i].isArchive || false) &&
            (await isTournamentAlreadyArchived(urlsToParse[i].sport, urlsToParse[i].id))
        ) {
            ;
        } else {
            setTimeout(() => { parseUrl(urlsToParse[i]) }, 10);
            currentPhantomCount++;
        }

        currentUrlIndex++;
    }

    if (urlsToParse.length === currentUrlIndex && !currentPhantomCount) {
        currentUrlIndex = 0;
    }

    setTimeout(startBunchParsing, 30000);
}

function isTournamentAlreadyArchived(sport, tournamentId) {
    return new Promise((resolve) => {
        archiveCompletedCollection
            .find({_id: `${sport};${tournamentId}` })
            .toArray((err, result) => {
                resolve(!!result.length);
            });
    });
}

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
};

for (const [sport, value] of Object.entries(URLS.sports)) {
    urlsToParse = urlsToParse.concat(
        value.archive.map((o) => ({
            id: o.id,
            url: URLS.createUrl(sport, o.id, true),
            isArchive: true,
            sport,
        })),
        value.urls.map((o) => ({
            id: o.id,
            url: URLS.createUrl(sport, o.id, true),
            sport,
        }))
    );
}


db.connectDB(db => {
    matchesCollection = db.collection('matches');
    scheduleCollection = db.collection('schedule');
    archiveCompletedCollection = db.collection('archive_completed');

    startBunchParsing(true);
});