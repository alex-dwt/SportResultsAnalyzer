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
const OFFICE0_SITE = process.env.OFFICE1_SITE;
const OFFICE1_SITE = process.env.OFFICE2_SITE;
const OFFICE2_SITE = process.env.OFFICE3_SITE;
const PASSWORD = process.env.PASSWORD;
const URLS = require("./sites");

const mongoClient = require('mongodb').MongoClient;
const mongoClientUrl = 'mongodb://mongodb:27017/scoresdb';
let mongoDB;

const app = express();
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static('web'));

/**
 * Access Control
 */
app.use(function(req, res, next) {
    if (typeof req.query.password !== 'undefined' &&  req.query.password === PASSWORD) {
        next();
    } else {
        res.status(403).send();
    }
});

/**
 * Date period parameters checker
 */
app.use(function(req, res, next) {
    let isValid = true;
    for (const type of ['dateTill', 'dateFrom']) {
        if (typeof req.query[type] === 'undefined' || req.query[type] === '') {
            isValid = false;
            break;
        }
    }

    if (isValid) {
        next();
    } else {
        res.status(422).send();
    }
});

/**
 * List of tournaments
 */
app.get('/tournaments', (req, res, next) =>
    fetcher
        .getTournamentsList(!!req.query.isArchived)
        .then((result) => res.json(result))
);

/**
 * List of teams in tournament
 */
app.get('/teams/:tournamentId', (req, res, next) =>
    fetcher
        .getTeamsList(req.params.tournamentId)
        .then((result) => res.json(result))
);

/**
 * Score table of tournament
 */
app.get('/score-table/:tournamentId', (req, res, next) =>
    fetcher
        .getTournamentResults(
            req.params.tournamentId,
            {dateFrom: req.query.dateFrom, dateTill: req.query.dateTill}
        )
        .then((result) => res.json(result))
);

/**
 * All matches of tournament
 */
app.get('/all-matches-table/:tournamentId', (req, res, next) =>
    fetcher
        .getTournamentMatches(
            req.params.tournamentId,
            {dateFrom: req.query.dateFrom, dateTill: req.query.dateTill},
            true
        )
        .then((result) => res.json(result))
);

/**
 * All matches of one team in tournament
 */
app.get('/team-matches-table/:tournamentId/:teamId', (req, res, next) =>
    fetcher
        .getTeamMatches(
            req.params.tournamentId,
            req.params.teamId,
            {dateFrom: req.query.dateFrom, dateTill: req.query.dateTill},
            true
        )
        .then((result) => res.json(result))
);

/**
 * Forecast
 */
app.get('/forecast/:num', (req, res, next) =>
    fetcher
        .getForecast(req.params.num, req.query)
        .then((result) => res.json(result))
);

/**
 * Get site url
 */
app.get('/site_urls/:tournamentId', (req, res, next) => {
    let id = `${req.params.tournamentId}`;
    let info = URLS.urls.find(o => o.id == id);
    let officesUrls = info
        ? info.urls
        : ['/', '/', '/'];

    res.json({
        matchesUrl: createUrl(id, true),
        scoreTableUrl: createUrl(id),
        officesUrls: officesUrls.map((val, index) => eval(`OFFICE${index}_SITE`) + val)
    });
});

/**
 * Forecast for next matches
 */
app.get('/next-matches', (req, res, next) =>
    fetcher.getNextMatches().then((result) => res.json(result))
);

/**
 * Mark future game as favorite
 */
app.put('/favorite_game', (req, res, next) =>
    fetcher.markGameAsFavorite(req.body.id).then(() => res.json({}))
);

/**
 * Unmark future game as favorite
 */
app.delete('/favorite_game', (req, res, next) =>
    fetcher.markGameAsFavorite(req.body.id, false).then(() => res.json({}))
);

function connectDB() {
    mongoClient
        .connect(mongoClientUrl)
        .then((db) => {
            fetcher.setMongoDb(db);
            mongoDB = db;

            // start parsing sites forever
            parser.start(
                URLS.archive.map((o) => ({
                    id: o.id,
                    url: createUrl(o.id, true),
                    isArchive: true,
                }))
                .concat(
                    URLS.urls.map((o) => ({
                        id: o.id,
                        url: createUrl(o.id, true)
                    }))
                ),
                mongoDB
            );
            
            app.listen(80);
        }).catch((err) =>  {
            console.log('Trying connecting MongoDB...');
            setTimeout(connectDB, 1000);
        });
}

function createUrl(tournamentId, isMatchesUrl) {
    let result = `${SITE_URL}/?sport=soccer&id=${parseInt(tournamentId.replace('a', ''))}&page=`;
    if (tournamentId.indexOf('r') !== -1) {
        result += 'round';
    } else if (tournamentId.indexOf('s') !== -1) {
        result += 'season';
    } else {
        result += 'competition';
    }
    if (isMatchesUrl) {
        result += '&view=matches';
    }

    return result;
}

connectDB();