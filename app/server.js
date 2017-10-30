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

const parserB = require("./write-bookmakers-to-db");


const mongoClient = require('mongodb').MongoClient;
const mongoClientUrl = 'mongodb://mongodb:27017/scoresdb';
let mongoDB;


mongoClient
    .connect(mongoClientUrl)
    .then((db) => {
        mongoDB = db;
        parserB.start(
            mongoDB
        );
    });


