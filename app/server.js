/*
 * This file is part of the SportResultsAnalyzer package.
 * (c) Alexander Lukashevich <aleksandr.dwt@gmail.com>
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';
const fs = require('fs');

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

function connectDB() {
    mongoClient
        .connect(mongoClientUrl)
        .then((db) => {
            let collection = db.collection('bookmakers_teams');
            let contents = fs.readFileSync('./1.json', 'utf8');
            contents = JSON.parse(contents);

            for (const item of contents) {
                let bookmakerId = 2;
                let tournamentId = item.tournamentId;
                let teamId = item.teamId;
                let id = `${bookmakerId};${tournamentId};${teamId};`;

                collection.insertOne({
                    _id: id,
                    bookmakerId,
                    tournamentId,
                    teamId,
                    teamName: item.teamName,
                }).catch(() => { });
            }


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



                    });
}


connectDB();