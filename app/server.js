/*
 * This file is part of the SportResultsAnalyzer package.
 * (c) Alexander Lukashevich <aleksandr.dwt@gmail.com>
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

const express = require("express");
const bodyParser = require("body-parser");
const phantom = require('phantom');
const cheerio = require('cheerio');
const SITE_URL = 'localhost';

const app = express();
app.use(bodyParser.json());

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

    (async function() {
        const instance = await phantom.create(['--ignore-ssl-errors=yes', '--load-images=no']);
        const page = await instance.createPage();
        await page.on('onResourceRequested',
            function(requestData) { console.log(requestData.url) }
        );

        const status = await page.open(SITE_URL);
        const content = await page.property('content');
        let tableElement = await page.evaluate(function() {
            return document.getElementsByClassName('matches');
        });

        await instance.exit();

        if (tableElement.length !== 1) {
            console.log('ERRRRRROR');
        } else {
            const $ = cheerio.load('<table id="myparsedtable">' + tableElement[0].innerHTML + '</table>');

            $('#myparsedtable').find('tr.match').each(function(i, elem) {
                console.log($(this).find('.team-a').eq(0).text().trim() + '  -  ' + $(this).find('.team-b').eq(0).text().trim());
            });
        }
    })();

    res.json({});
});

app.listen(80);