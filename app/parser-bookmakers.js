const cheerio = require('cheerio');
const request = require('request');
const fetcher = require("./fetcher");
const fs = require('fs');

let bookmakersCollection,
    isStarted,
    urls;

module.exports = {
    start() {
        fs.readdirSync('./teams/').every(file => {
            file = './teams/' + file;

            let contents = fs.readFileSync(file, 'utf8');
            contents = JSON.parse(contents);

            let url = contents.url;

            request(url, function (error, response, body) {
                if (error || response.statusCode !== 200) {
                    console.log('Failed download page');
                }

                console.log('Downloaded! ' + url);
                const $ = cheerio.load(body);
                let teams = [];

                let $table = $('table.foot-market');
                if ($table.length !== 1) {
                    console.log('Skip!');
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

                    let newTeams = [];
                    let teamNames = contents.teamNames;

                    teams.forEach(t => {
                        let founded = contents.teamsToDo.find(o => o.name === t);
                        if (!founded) {
                            let value = '';

                            for (let j = 0; j < teamNames.length; j++) {
                                if (teamNames[j].indexOf(t + '@') === 0) {
                                    value = teamNames[j];
                                    teamNames[j] = '';
                                    break;
                                }
                            }

                            newTeams.push({
                                name: t,
                                value
                            });
                        }
                    });

                    if (newTeams.length) {
                        let o = {
                            id: contents.id,
                            url: contents.url,
                            tournamentName: contents.tournamentName,
                            teamsToDo: contents.teamsToDo.concat(newTeams),
                            teamNames: teamNames.filter(o => o !== ''),
                        };

                        fs.writeFile(file, JSON.stringify(o), function(err) {
                            console.log('Done');
                        });
                    }
                }
            });

            return true;
        });

    }
};




function sortStringsAlphabetically(a, b, field) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}