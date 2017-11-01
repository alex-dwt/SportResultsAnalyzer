const cheerio = require('cheerio');
const request = require('request');
const fetcher = require("./fetcher");
const fs = require('fs');

let bookmakersCollection,
    isStarted,
    urls, collection;

function trim(string) {
    return string.replace(/^\s*|\s*$/g, '');
}

module.exports = {
    start(mongoDb) {
        collection = mongoDb.collection('bookmakers_teams');



        fs.readdirSync('./teams/').every(file => {
            file = './teams/' + file;

            let contents = fs.readFileSync(file, 'utf8');
            contents = JSON.parse(contents);

            for (let j = 0; j < contents.teamsToDo.length; j++) {
                let pos = contents.teamsToDo[j].value.indexOf('@');
                if (pos !== -1) {
                    let bookmakerId = 2;
                    let tournamentId = contents.id;
                    let teamId = parseInt(contents.teamsToDo[j].value.substring(pos + 1));
                    let id = `${bookmakerId};${tournamentId};${teamId};`;

                    collection.insertOne({
                        _id: id,
                        bookmakerId,
                        tournamentId,
                        teamId,
                        teamName: trim(contents.teamsToDo[j].name.toLowerCase()),
                    }).catch(() => { });

                    contents.teamsToDo[j].name = '';
                }
            }

            contents.teamsToDo = contents.teamsToDo.filter(o => o.name !== '');

            fs.writeFile(file, JSON.stringify(contents), function(err) {
                console.log('Done ' + file);
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