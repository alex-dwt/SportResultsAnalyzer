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
const includes = require('array-includes');
const SITE_URL = process.env.SITE_URL;
const PASSWORD = process.env.PASSWORD;

const mongoClient = require('mongodb').MongoClient;
const mongoClientUrl = 'mongodb://mongodb:27017/scoresdb';
let mongoDB;

const app = express();
app.use(bodyParser.json());
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
app.get('/tournaments', (req, res, next) => {
    fetcher
        .getTournamentsList(mongoDB.collection('matches'))
        .then((result) => res.json(result));
});

/**
 * List of teams in tournament
 */
app.get('/teams/:tournamentId', (req, res, next) => {
    fetcher
        .getTeamsList(mongoDB.collection('matches'), req.params.tournamentId)
        .then((result) => res.json(result));
});

/**
 * Score table of tournament
 */
app.get('/score-table/:tournamentId', (req, res, next) => {
    fetcher
        .getTournamentResults(
            mongoDB.collection('matches'),
            req.params.tournamentId,
            {dateFrom: req.query.dateFrom, dateTill: req.query.dateTill}
        )
        .then((result) => res.json(result));
});

/**
 * All matches of tournament
 */
app.get('/all-matches-table/:tournamentId', (req, res, next) => {
    mongoDB.collection('matches')
        .find({
            tournamentId: parseInt(req.params.tournamentId) || 0,
            date: {
                $gte: (new Date(req.query.dateFrom)),
                $lte: (new Date(req.query.dateTill))
            }
        })
        .sort({date: -1})
        .toArray((err, result) => res.json(result));
});

/**
 * All matches of one team in tournament
 */
app.get('/team-matches-table/:tournamentId/:teamId', (req, res, next) => {
    fetcher
        .getTeamMatches(
            mongoDB.collection('matches'),
            req.params.tournamentId,
            req.params.teamId,
            {dateFrom: req.query.dateFrom, dateTill: req.query.dateTill}
        )
        .then((result) => res.json(result));
});

/**
 * Forecast
 */
app.get('/forecast/:num', (req, res, next) => {
    fetcher
        .getForecast(
            req.params.num,
            mongoDB.collection('matches'),
            req.query
        )
        .then((result) => res.json(result));
});

/**
 * Forecast for next matches
 */
app.get('/next-matches', (req, res, next) => {
    let today = new Date();
    today.setHours(0,0,0,0);
    mongoDB.collection('schedule')
        .find({date: {$gte: new Date(today)}})
        .sort({date: 1, tournamentName: 1, tournamentId: 1, homeTeamName: 1})
        .toArray((err, result) => (async () => {
            let statistics = {};
            let period = {
                dateFrom: '1970-01-01',
                dateTill: '2500-01-01',
            };
            for (let i = 0, length = result.length; i < length; i++) {
                let item = result[i];
                if (typeof statistics[item.tournamentId] === 'undefined') {
                    statistics[item.tournamentId] = {
                        positionsCount: await fetcher.getTeamPositionsCountInScoreTable(
                            mongoDB.collection('matches'),
                            item.tournamentId,
                            period
                        ),
                        teams: {}
                    };
                }
                statistics[item.tournamentId]['teams'][`${item.homeTeamId}-${item.guestTeamId}`] = await fetcher.getTeamPositionsDifference(
                    mongoDB.collection('matches'),
                    item.tournamentId, period,
                    item.homeTeamId,
                    item.guestTeamId
                )
            }

            let promises = [];
            const forecastsCount = 2;
            let alreadyCalculated = {};
            result.forEach((el, index) => {
                result[index].scores = [];

                for (let num = 1; num <= forecastsCount; num++) {
                    if (typeof alreadyCalculated[el.tournamentId] !== 'undefined'
                        && (
                            includes(alreadyCalculated[el.tournamentId], el.homeTeamId) ||
                            includes(alreadyCalculated[el.tournamentId], el.guestTeamId)
                        )
                    ) {
                        promises.push(new Promise((resolve) => resolve(null)));
                    } else {
                        promises.push(fetcher.getForecast(num, mongoDB.collection('matches'),
                            Object.assign({
                                tournamentId: el.tournamentId,
                                teamAId: el.homeTeamId,
                                teamBId: el.guestTeamId
                            }, period)
                        ));
                    }
                }

                if (typeof alreadyCalculated[el.tournamentId] === 'undefined') {
                    alreadyCalculated[el.tournamentId] = [];
                }
                alreadyCalculated[el.tournamentId].push(
                    el.homeTeamId,
                    el.guestTeamId
                );
            });

            Promise.all(promises).then((promiseRes) => {
                let resInd = 0, fInd = 0;
                promiseRes.forEach((el) => {
                    fInd++;
                    if (el) {
                        result[resInd].scores.push(`${fInd}) ${el.scoreLineShort}`);
                    }
                    if (fInd === forecastsCount) {
                        fInd = 0;
                        resInd++;
                    }
                });
                res.json({
                    items: result,
                    statistics
                });
            });
        })());
});

function connectDB() {
    mongoClient
        .connect(mongoClientUrl)
        .then((db) => {
            mongoDB = db;

            // start parsing sites forever
            let urls = [
                15,32,22,35,28,37,8,122,70,440,59,67,68,24,59,30,39,76,119,120,
                16,17,121,49,66,26,89,629,29,36,123,86,125,233,82,83,27,163,9,
                11,622,107,206,117,31,38,7,12,13,14,215,51,1,5
            ];
            parser.start(
                urls.map((id) => ({id, url: `${SITE_URL}/?sport=soccer&page=competition&id=${id}&view=matches`})),
                mongoDB
            );
            
            app.listen(80);
        }).catch((err) =>  {
            console.log('Trying connecting MongoDB...');
            setTimeout(connectDB, 1000);
        });
}

connectDB();
