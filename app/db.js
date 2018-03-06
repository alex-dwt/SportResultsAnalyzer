/*
 * This file is part of the SportResultsAnalyzer package.
 * (c) Alexander Lukashevich <aleksandr.dwt@gmail.com>
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

const mongoClient = require('mongodb').MongoClient;
const mongoClientUrl = 'mongodb://mongodb:27017/scoresdb';

module.exports = {
    connectDB(callback) {
        connectDB(callback);
    }
};

function connectDB(callback) {
    mongoClient
        .connect(mongoClientUrl)
        .then(db => {
            console.log('Connected!');
            callback(db);
        }).catch(err =>  {
            console.log('Trying connecting MongoDB...');
           setTimeout(() => connectDB(callback), 1000);
        });
}