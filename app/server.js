/*
 * This file is part of the SportResultsAnalyzer package.
 * (c) Alexander Lukashevich <aleksandr.dwt@gmail.com>
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

const parser = require("./parser");
const fetcher = require("./fetcher");
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
    fetcher
        .getTournamentsList(mongoCollection)
        .then((result) => res.json(result));
});

/**
 * List of teams in tournament
 */
app.get('/teams/:tournamentId', (req, res, next) => {
    fetcher
        .getTeamsList(mongoCollection, req.params.tournamentId)
        .then((result) => res.json(result));
});

/**
 * Score table of tournament
 */
app.get('/score-table/:tournamentId', (req, res, next) => {
    fetcher
        .getTournamentResults(mongoCollection, req.params.tournamentId)
        .then((result) => res.json(result));
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
    fetcher
        .getTeamMatches(mongoCollection, req.params.tournamentId, req.params.teamId)
        .then((result) => res.json(result));
});

/**
 * Forecast 1
 */
app.get('/forecast1', (req, res, next) => {
    fetcher
        .getForecast1(
            mongoCollection,
            req.query.tournamentId,
            req.query.teamAId,
            req.query.teamBId
        )
        .then((result) => res.json(result));
});


mongoClient
    .connect(mongoClientUrl)
    .then((db) => {
        mongoCollection = db.collection('matches');

        // start parsing sites forever
        let urls = [15,32,22,35,28,37,8];
        parser.start(
            urls.map((id) => ({id, url: `${SITE_URL}/?sport=soccer&page=competition&id=${id}&view=matches`})),
            mongoCollection
        );
    }).catch(
        (err) =>  console.log('Sorry unable to connect to MongoDB Error:', err)
    );

app.listen(80);