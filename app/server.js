/*
 * This file is part of the SportResultsAnalyzer package.
 * (c) Alexander Lukashevich <aleksandr.dwt@gmail.com>
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

const parser = require("./parser");
const express = require("express");
const bodyParser = require("body-parser");
const SITE_URL = process.env.SITE_URL;

const mongoClient = require('mongodb').MongoClient;
const mongoClientUrl = 'mongodb://mongodb:27017/scoresdb';
let mongoCollection;

const app = express();
app.use(bodyParser.json());
app.use(express.static('web'));

/**
 * List of tournaments
 */
app.get('/tournaments', (req, res, next) => {
    mongoCollection
        .aggregate(
            {$group: {_id: {tournamentId:"$tournamentId",tournamentName:"$tournamentName"}}},
            {$sort: { "_id.tournamentName": 1}}
        )
        .toArray((err, result) => res.json(result.map(val => val._id )));
});

/**
 * List of teams in tournament
 */
app.get('/teams/:tournamentId', (req, res, next) => {
    mongoCollection
        .aggregate([
            {$match: {tournamentId: parseInt(req.params.tournamentId) || 0}},
            {$group : {
                _id : "",
                home: {$addToSet: {teamId: "$homeTeamId", teamName: "$homeTeamName"}},
                guest: {$addToSet: {teamId: "$guestTeamId", teamName: "$guestTeamName"}}
            }},
            {$project: {items: {$setUnion: ["$home", "$guest"]}, _id: 0}}]
        ).toArray((err, result) => res.json(result[0].items));
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
    mongoCollection
        .find({tournamentId: parseInt(req.params.tournamentId) || 0})
        .sort({date: -1})
        .toArray((err, result) => res.json(result));
});

/**
 * All matches of one team in tournament
 */
app.get('/team-matches-table/:tournamentId/:teamId', (req, res, next) => {
    mongoCollection
        .find({
            tournamentId: parseInt(req.params.tournamentId) || 0,
            $or: [
                {homeTeamId: parseInt(req.params.teamId) || 0},
                {guestTeamId:parseInt(req.params.teamId) || 0}
            ]
        })
        .sort({date: -1})
        .toArray((err, result) => res.json(result));
});


mongoClient
    .connect(mongoClientUrl)
    .then((db) => {
        mongoCollection = db.collection('matches');

        // start parsing sites forever
        let urls = [
            {
                id: 15,
                url: SITE_URL + '/?sport=soccer&page=competition&id=15&view=matches'
            },
            {
                id: 32,
                url: SITE_URL + '/?sport=soccer&page=competition&id=32&view=matches',
            },
        ];
        parser.start(urls, mongoCollection);
    }).catch(
        (err) =>  console.log('Sorry unable to connect to MongoDB Error:', err)
    );

app.listen(80);