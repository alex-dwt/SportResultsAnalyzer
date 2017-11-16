/*
 * This file is part of the SportResultsAnalyzer package.
 * (c) Alexander Lukashevich <aleksandr.dwt@gmail.com>
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';
const fs = require('fs');
let unique = require('array-unique');

const parser = require("./parser");
const fetcher = require("./fetcher");
const express = require("express");
const bodyParser = require("body-parser");
const SITE_URL = process.env.SITE_URL;
const OFFICE0_SITE = process.env.OFFICE1_SITE;
const OFFICE1_SITE = process.env.OFFICE2_SITE;
const OFFICE2_SITE = process.env.OFFICE3_SITE;
const PASSWORD = process.env.PASSWORD;
const URLS = require("./sites");

const mongoClient = require('mongodb').MongoClient;
const mongoClientUrl = 'mongodb://mongodb:27017/scoresdb';
let mongoDB;

function sortStringsAlphabetically(a, b) {
    a = a.replace(/ /g, '').toLowerCase();
    b = b.replace(/ /g, '').toLowerCase();
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}

function connectDB() {
    mongoClient
        .connect(mongoClientUrl)
        .then((db) => {
            fetcher.setMongoDb(db);

            for (const item of URLS.urls) {

                db.collection('bookmakers_matches')
                    .find({
                        bookmakerId: 2,
                        tournamentId: item.id,
                    })
                    .toArray((err, result) => {
                        let teams = [];

                        for (const res of result) {
                            teams.push(res.guestTeamName.trim().toLowerCase());
                            teams.push(res.homeTeamName.trim().toLowerCase());
                        }

                        unique(teams);

                        teams = teams.sort((a, b) => sortStringsAlphabetically(a, b));
                        let teamsToDo = teams.map(name => ({name, value: ''}));

                        fetcher
                            .getTeamsList(item.id)
                            .then((res) => {
                                let teamNames = res.map(o => `${o.teamName.toLowerCase()}@${o.teamId}`);

                                // correlate already in DB
                                let correlated = 0;
                                for (let j = 0; j < teamNames.length; j++) {
                                    let teamId = parseInt(teamNames[j].substring(teamNames[j].indexOf('@') + 1));
                                    let teamName = teamNames[j];
                                    let teamIndex = j;

                                    db.collection('bookmakers_teams')
                                        .find({
                                            bookmakerId: 2,
                                            tournamentId: item.id,
                                            teamId,
                                        })
                                        .toArray((err, result) => {
                                            if (result.length) {
                                                for (let i = 0; i < teamsToDo.length; i++) {
                                                    if (teamsToDo[i].name === result[0].teamName) {
                                                        teamsToDo[i].value = teamName;
                                                        teamNames[teamIndex] = '';
                                                        break;
                                                    }
                                                }
                                            }
                                            correlated++;
                                        });
                                }

                                setInterval(() => {
                                    if (correlated === teamNames.length) {
                                        correlated = -1;

                                        teamNames = teamNames.filter(o => o !== '');

                                        // auto correlate
                                        for (let i = 0; i < teamsToDo.length; i++) {
                                            for (let j = 0; j < teamNames.length; j++) {
                                                if (teamNames[j].indexOf(teamsToDo[i].name + '@') === 0) {
                                                    teamsToDo[i].value = teamNames[j];
                                                    teamNames[j] = '';
                                                    break;
                                                }
                                            }
                                        }
                                        teamNames = teamNames.filter(o => o !== '');


                                        // write
                                        let o = {
                                            id: item.id,
                                            url: item.urls[1],
                                            teamNames,
                                            teamsToDo,
                                        };

                                        fs.writeFile('/usr/src/app/teams/' + item.id + '.json', JSON.stringify(o), function(err) {
                                            console.log('Done');
                                        });
                                    }
                                }, 1000);
                            });
                });
            }
        });





            //
            //
            //
            //     let collection = db.collection('bookmakers_teams');
            // let contents = fs.readFileSync('./1.json', 'utf8');
            // contents = JSON.parse(contents);
            //
            // for (const item of contents) {
            //     let bookmakerId = 2;
            //     let tournamentId = item.tournamentId;
            //     let teamId = item.teamId;
            //     let id = `${bookmakerId};${tournamentId};${teamId};`;
            //
            //     collection.insertOne({
            //         _id: id,
            //         bookmakerId,
            //         tournamentId,
            //         teamId,
            //         teamName: item.teamName,
            //     }).catch(() => { });
            // }


            // fs.readdirSync('./teams/').every(file => {
            //     file = './teams/' + file;

                // let contents = fs.readFileSync(file, 'utf8');
                // contents = JSON.parse(contents);

                // for (let j = 0; j < contents.teamsToDo.length; j++) {
                //     let pos = contents.teamsToDo[j].value.indexOf('@');
                //     // if (pos !== -1) {
                //         collection.insertOne({
                //             bookmakerId: 2,
                //             tournamentId: contents.id,
                //             teamId: parseInt(contents.teamsToDo[j].value.substring(pos + 1)),
                //             teamName: trim(contents.teamsToDo[j].name.toLowerCase()),
                //         }).catch(() => { });



                    // });
}


connectDB();