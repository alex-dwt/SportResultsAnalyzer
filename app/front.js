/*
 * This file is part of the SportResultsAnalyzer package.
 * (c) Alexander Lukashevich <aleksandr.dwt@gmail.com>
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

const db = require("./db");
const compression = require('compression');
const fetcher = require("./fetcher");
const express = require("express");
const bodyParser = require("body-parser");
const OFFICE0_SITE = process.env.OFFICE1_SITE;
const OFFICE1_SITE = process.env.OFFICE2_SITE;
const OFFICE2_SITE = process.env.OFFICE3_SITE;
const PASSWORD = process.env.PASSWORD;
const URLS = require("./sites");
const settings = require("./settings");

const app = express();
app.use(bodyParser.json());
app.use(compression());
// app.use(bodyParser.urlencoded());
app.use(express.static('web'));
app.use('/front', express.static('front/public'));

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
app.get('/tournaments/:sport', (req, res, next) =>
    fetcher
        .getTournamentsList(req.params.sport, !!req.query.isArchived)
        .then((result) => res.json(result))
);

/**
 * List of teams in tournament
 */
app.get('/teams/:sport/:tournamentId', (req, res, next) =>
    fetcher
        .getTeamsList(req.params.sport, req.params.tournamentId)
        .then((result) => res.json(result))
);

/**
 * Score table of tournament
 */
app.get('/score-table/:sport/:tournamentId', (req, res, next) =>
    fetcher
        .getTournamentResults(
            req.params.sport,
            req.params.tournamentId,
            {dateFrom: req.query.dateFrom, dateTill: req.query.dateTill}
        )
        .then((result) => res.json(result))
);

/**
 * All matches of tournament
 */
app.get('/all-matches-table/:sport/:tournamentId', (req, res, next) =>
    fetcher
        .getTournamentMatches(
            req.params.sport,
            req.params.tournamentId,
            {dateFrom: req.query.dateFrom, dateTill: req.query.dateTill},
            true
        )
        .then((result) => res.json(result))
);

/**
 * All matches of one team in tournament
 */
app.get('/team-matches-table/:sport/:tournamentId/:teamId', (req, res, next) =>
    fetcher
        .getTeamMatches(
            req.params.sport,
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
app.get('/site_urls/:sport/:tournamentId', (req, res, next) => {
    let id = `${req.params.tournamentId}`;
    let sport = `${req.params.sport}`;
    let info = URLS.sports[sport].urls.find(o => o.id == id);
    let officesUrls = info
        ? info.urls
        : ['/', '/', '/'];

    res.json({
        matchesUrl: URLS.createUrl(sport, id, true),
        scoreTableUrl: URLS.createUrl(sport, id),
        officesUrls: officesUrls.map((val, index) => eval(`OFFICE${index}_SITE`) + val)
    });
});

/**
 * Forecast for next matches
 */
app.get('/next-matches/:sport', (req, res, next) =>
    fetcher.getNextMatches(req.params.sport, req.query.date).then((result) => res.json(result))
);

/**
 * Forecast for prev matches
 */
app.get('/prev-matches/:sport', (req, res, next) =>
    fetcher.getNextMatches(req.params.sport, req.query.date, true).then((result) => res.json(result))
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

/**
 * Save calculated stats from Analysis Table
 */
app.post('/tournament_analysis', (req, res, next) =>{
    fetcher.createTournamentAnalysisItem(req.body).then(() => res.json({}))}
);

/**
 * Get calculated stats from Analysis Table
 */
app.get('/tournament_analysis', (req, res, next) =>{
    fetcher.getTournamentAnalysisItems().then((data) => res.json(data))}
);

/**
 * Get calculated stats from Analysis Table
 */
app.get('/tournament_analysis_check', (req, res, next) =>{
    fetcher
        .isTournamentAnalysisExists(
            req.query.sport,
            req.query.tournamentId,
            req.query.filterId,
        )
        .then((isExists) => res.json({isExists}))}
);

/**
 *
 */
app.get('/totals_probability', (req, res, next) =>{
    fetcher
        .calculateTotalGoalsProbability(
            req.query.dateTill,
            req.query.sport,
            req.query.tournamentId,
            req.query.teamId,
        )
        .then(result => res.json(result))}
);

/**
 * Settings //todo
 */
app.get('/settings', (req, res, next) => {
    settings.setForecast4MatchesCount(req.query.value);
    res.json({});
});

db.connectDB(db => {
    fetcher.setMongoDb(db);
    settings.setMongoDb(db);

    app.listen(80);
});