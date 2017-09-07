/*
 * This file is part of the SportResultsAnalyzer package.
 * (c) Alexander Lukashevich <aleksandr.dwt@gmail.com>
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let express = require("express");
let bodyParser = require("body-parser");

let app = express();
app.use(bodyParser.json());
// app.use(express.static('/car-pi/client'));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');

    if (req.method.toLowerCase() === 'options') {
        res.status(204).send();
    } else {
        next();
    }
});

app.get('/start', (req, res, next) => {
    res.json({});
});

app.listen(80);