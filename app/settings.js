/*
 * This file is part of the SportResultsAnalyzer package.
 * (c) Alexander Lukashevich <aleksandr.dwt@gmail.com>
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

const FORECAST_4_MATCHES_COUNT_PARAM = 'forecast4MatchesCount';
const FORECAST_4_MATCHES_DEFAULT_COUNT = 2;

let settingsCollection;

module.exports = {
    setMongoDb: (db) => {
        settingsCollection = db.collection('settings');
    },
    getForecast4MatchesCount: () => new Promise(
        resolve => settingsCollection
            .find({name: FORECAST_4_MATCHES_COUNT_PARAM})
            .toArray((err, result) => {
                let res = result.length ? parseInt(result[0].value) : 0;
                resolve(res ? res : FORECAST_4_MATCHES_DEFAULT_COUNT)
        })
    ),
    setForecast4MatchesCount: (value) => {
        value = parseInt(value) || 0;
        if (value < 1) {
            value = 1;
        }

        settingsCollection.update(
            {name: FORECAST_4_MATCHES_COUNT_PARAM},
            {name: FORECAST_4_MATCHES_COUNT_PARAM, value},
            {upsert: true}
        );
    },
};