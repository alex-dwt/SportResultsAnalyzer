const cheerio = require('cheerio');
const request = require('request');
const fetcher = require("./fetcher");
const fs = require('fs');

let bookmakersCollection,
    isStarted,
    urls;

module.exports = {
    start(urlsToParse, mongoDB) {
        if (isStarted) {
            return;
        }

        isStarted = true;
        urls = urlsToParse;
        bookmakersCollection = mongoDB.collection('bookmakers');

        setTimeout(() => parse(), 500);
    }
};

async function parse() {
    while (true) {
        let url = urls.pop();
        if (!url) {
            console.log('done done done done');
            break;
        }
        await parseOne(url);
    }
}

async function parseOne(url) {
    return new Promise((resolve) => {
        request(url.url, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                console.log('Failed download page');
                resolve('');
            }

            console.log('Downloaded! ' + url.url);
            const $ = cheerio.load(body);
            let teams = [];

            let $table = $('table.foot-market');
            if ($table.length !== 1) {
                console.log('Skip!');
                resolve('');
            }

            $table.children().each(function(i, elem) {
                let res = $(this).data('eventName');
                if (!res) {
                    return true;
                }
                let arr = res.split(' - ');
                if (arr.length == 2) {
                    teams = teams.concat(arr);
                }
            });
            teams = teams.map(o => o.toLowerCase());
            teams = teams.filter(function(elem, pos) {
                return teams.indexOf(elem) == pos;
            });

            teams.sort((a, b) => sortStringsAlphabetically(a, b));

            if (teams.length) {
                fetcher
                    .getTeamsList(url.id)
                    .then((teamNames) => {
                        fetcher
                            .getTournamentsList(false)
                            .then((tournamentsList) => {
                                let tournamentName = tournamentsList.find(o => o.tournamentId === url.id).tournamentName;
                                teamNames= teamNames.map(o => `${o.teamName.toLowerCase()}@${o.teamId}`);
                                let teamsToDo = teams.map(o => ({name: o, value: ''}));

                                for (let i = 0; i < teamsToDo.length; i++) {
                                    for (let j = 0; j < teamNames.length; j++) {
                                        if (teamNames[j].indexOf(teamsToDo[i].name + '@') === 0) {
                                            teamsToDo[i].value = teamNames[j];
                                            teamNames[j] = '';
                                            break;
                                        }
                                    }
                                }

                                let o = {
                                    id: url.id,
                                    url: url.url,
                                    tournamentName,
                                    teamsToDo,
                                    teamNames: teamNames.filter(o => o !== '')
                                };

                                fs.writeFile('/usr/src/app/teams/' + url.id + '.json', JSON.stringify(o), function(err) {
                                    console.log('Done');
                                    resolve('');
                                });
                        });
                        }
                    )
            }

            resolve('');
        });
    });
}

function sortStringsAlphabetically(a, b, field) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}