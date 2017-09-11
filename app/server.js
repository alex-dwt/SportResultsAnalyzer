/*
 * This file is part of the SportResultsAnalyzer package.
 * (c) Alexander Lukashevich <aleksandr.dwt@gmail.com>
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cheerio = require('cheerio');
const FILE_PATH = '/usr/src/app/output.txt';
const request = require('request');
const SITE_URL = process.env.SITE_URL;
const mongoClient = require('mongodb').MongoClient;
const mongoClientUrl = 'mongodb://mongodb:27017/scoresdb';

const app = express();
app.use(bodyParser.json());
app.use(express.static('web'));

/**
 * List of tournaments
 */
app.get('/tournaments', (req, res, next) => {
    res.json([{id:1, name:'name'},{id:1, name:'name'},{id:1, name:'name'}]);
});

/**
 * List of teams in tournament
 */
app.get('/teams/:tournamentId', (req, res, next) => {
    // req.params.tournamentId
    res.json([{id:1, name:'team1'},{id:1, name:'team2'},{id:1, name:'team3'}]);
});

/**
 * Score table of tournament
 */
app.get('/score-table/:tournamentId', (req, res, next) => {
    // req.params.tournamentId
    res.json([{id:1, name:'team1'},{id:1, name:'team2'},{id:1, name:'team3'}]);
});

/**
 * All matches of tournament
 */
app.get('/all-matches-table/:tournamentId', (req, res, next) => {
    // req.params.tournamentId
    res.json([{id:1, name:'team1'},{id:1, name:'team2'},{id:1, name:'team3'}]);
});

/**
 * All matches of one team in tournament
 */
app.get('/team-matches-table/:tournamentId/:teamId', (req, res, next) => {
    // req.params.tournamentId
    // req.params.teamId
    res.json([{id:1, name:'team1'},{id:1, name:'team2'},{id:1, name:'team3'}]);
});


// mongoClient
//     .connect(mongoClientUrl)
//     .then((db) => {
//         const collection = db.collection('matches');
//
//         fs.readFile(FILE_PATH, 'utf8', function (err,data) {
//             if (err) {
//                 return console.log(err);
//             }
//             let arr = data.split("\r\n");
//             for (let url of arr) {
//                 if (url.indexOf('http://') !== 0) {
//                     continue;
//                 }
//                 console.log('Trying to download page');
//                 request(url, function (error, response, body) {
//                     if (error || response.statusCode !== 200) {
//                         console.log('Failed download page');
//                         return;
//                     }
//
//                     const $ = cheerio.load(
//                         JSON.parse(body).commands.filter(obj => obj.name === 'updateContainer')[0].parameters.content
//                 );
//
//                     $('table').find('tr.match').each(function(i, elem) {
//                         let score = $(this).find('.score-time').eq(0).text().trim();
//                         score = score.split('-');
//                         if (score.length !== 2) {
//                             return true;
//                         }
//
//                         let homeScore = parseInt(score[0]);
//                         let guestScore = parseInt(score[1]);
//
//                         if (isNaN(homeScore) || isNaN(guestScore)) {
//                             return true;
//                         }
//
//                         let homeTeamId = $(this).find('.team-a').eq(0).find('a').eq(0).attr('href');
//                         let pos = homeTeamId.indexOf('&id=');
//                         if (pos !== -1) {
//                             homeTeamId = homeTeamId.substring(pos + 4)
//                         }
//                         let homeTeam = $(this).find('.team-a').eq(0).text().trim();
//                         let guestTeamId = $(this).find('.team-b').eq(0).find('a').eq(0).attr('href');
//                         pos = guestTeamId.indexOf('&id=');
//                         if (pos !== -1) {
//                             guestTeamId = guestTeamId.substring(pos + 4)
//                         }
//                         let guestTeam = $(this).find('.team-b').eq(0).text().trim();
//                         let date = $(this).find('.date').eq(0).text().trim();
//
//                         date = date.split('/');
//
//                         let item = {
//                             homeScore,
//                             guestScore,
//                             homeTeam,
//                             homeTeamId,
//                             guestTeam,
//                             guestTeamId,
//                             date: (new Date(date[1] + '/' + date[0] + '/' + date[2])).toISOString()
//                         };
//
//                         collection.insertOne(item, function(err, records) {
//                             console.log("Record added :- " + records);
//                         });
//                     });
//                 });
//             }
//         });
//     }).catch(
//         (err) =>  console.log('Sorry unable to connect to MongoDB Error:', err)
//     );


app.listen(80);