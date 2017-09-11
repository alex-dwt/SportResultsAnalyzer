const { spawn } = require('child_process');
const cheerio = require('cheerio');
const request = require('request');

const delay = 5 * 60 * 1000; // minutes
let mongoCollection, isStarted;

function startWatching(url) {
    let title = '';
    let proc = spawn(
        '/usr/src/app/node_modules/.bin/phantomjs',
        ['--ignore-ssl-errors=yes', '--load-images=no', '/usr/src/app/phantom.js', url.url]
    );

    proc.stdout.setEncoding('utf8');

    proc.stdout.on('data', (data) => {
        if (data.indexOf('http://') === 0) {
            // download page
            request(data, function (error, response, body) {
                if (error || response.statusCode !== 200) {
                    console.log('Failed download page');
                    return;
                }

                const $ = cheerio.load(
                    JSON.parse(body).commands.filter(obj => obj.name === 'updateContainer')[0].parameters.content
                );

                $('table').find('tr.match').each(function(i, elem) {
                    let score = $(this).find('.score-time').eq(0).text().trim();
                    score = score.split('-');
                    if (score.length !== 2) {
                        return true;
                    }

                    let homeScore = parseInt(score[0]);
                    let guestScore = parseInt(score[1]);

                    if (isNaN(homeScore) || isNaN(guestScore)) {
                        return true;
                    }

                    let homeTeamId = $(this).find('.team-a').eq(0).find('a').eq(0).attr('href');
                    let pos = homeTeamId.indexOf('&id=');
                    if (pos !== -1) {
                        homeTeamId = homeTeamId.substring(pos + 4)
                    }
                    let homeTeam = $(this).find('.team-a').eq(0).text().trim();
                    let guestTeamId = $(this).find('.team-b').eq(0).find('a').eq(0).attr('href');
                    pos = guestTeamId.indexOf('&id=');
                    if (pos !== -1) {
                        guestTeamId = guestTeamId.substring(pos + 4)
                    }
                    let guestTeam = $(this).find('.team-b').eq(0).text().trim();
                    let date = $(this).find('.date').eq(0).text().trim();
                    date = date.split('/');
                    let item = {
                        homeScore,
                        guestScore,
                        homeTeam,
                        homeTeamId,
                        guestTeam,
                        guestTeamId,
                        date: (new Date(date[1] + '/' + date[0] + '/' + date[2])).toISOString()
                    };

                    console.log('title - ' + title);
                    console.log('id - ' + url.id);
                    console.log(item);
                });
            });
        } else {
            title = data;
        }
    });

    proc.on('close', () => {
        console.log('PhantomJS exited.');
        setTimeout(() => startWatching(url), delay);
    });
}



module.exports = {
    start(urls, collection) {
        if (isStarted) {
            return;
        }
        isStarted = true;
        mongoCollection = collection;
        for (const url of urls) {
            setTimeout(() => startWatching(url), 10);
        }
    }
};