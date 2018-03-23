import React from 'react';
import { Button, Progress } from 'semantic-ui-react'
import Request  from './Request.jsx'
import { App } from './index.jsx'
import AnalysisTable  from './teamMatches/AnalysisTable.jsx'
import AnalysisTableFilterBlock  from './filterBlocks/AnalysisTableFilterBlock.jsx'
import The5thForecastAllPlusesFilter  from './filters/The5thForecastAllPlusesFilter.jsx'
import The5thForecastNoMinusesFilter  from './filters/The5thForecastNoMinusesFilter.jsx'
import {The9thForecastFilter}  from './filters/The9thForecastFilter.jsx'
import The10thForecastFilter  from './filters/The10thForecastFilter.jsx'

const intersect = require('intersect');

const CURRENT_TOURNAMENTS = 'current';
const ARCHIVED_TOURNAMENTS = 'archived';
const FILTERS = [
    // {
    //     name: '5f no minuses;',
    //     payload: {
    //         callback: (matches) => AnalysisTableFilterBlock.doFiltering(
    //             matches,
    //             The5thForecastNoMinusesFilter.doFiltering(
    //                 matches,
    //                 (item) => item.extraInfo.scores
    //             ).map((o) => o._id)
    //         ),
    //     },
    // },
    // {
    //     name: '5f all pluses;',
    //     payload: {
    //         callback: (matches) => AnalysisTableFilterBlock.doFiltering(
    //             matches,
    //             The5thForecastAllPlusesFilter.doFiltering(
    //                 matches,
    //                 (item) => item.extraInfo.scores
    //             ).map((o) => o._id)
    //         ),
    //     },
    // },
].concat((() => {
    let result = [];
    let callbacks = [];

    for(const type of [
        The9thForecastFilter.ANALYSIS_TYPE_GT_2,
        // The9thForecastFilter.ANALYSIS_TYPE_GT_2_AND_HALF
    ]) {
        for (let goalsCount = 2; goalsCount <= 2; goalsCount++) {
            for (let percents = 20; percents <= 20; percents += 10) {
                for(const sign of ['>', '>>']) {
                    const name = `${goalsCount}: ${sign}${percents}%`;

                    result.push({
                        name: `10f (2 >> 60) + 9f (${type}) ${name}`,
                        payload: {
                            callback: (matches) => The9thForecastFilter.doAnalysis(
                                matches,
                                (matches) => intersect(
                                    The9thForecastFilter
                                        .doFiltering(
                                            `${goalsCount}:${percents}:${sign}`,
                                            matches,
                                            (item) => item.extraInfo.scores
                                        ).map((o) => o._id),
                                    The10thForecastFilter
                                        .doFiltering(
                                            `2:60:>>`,
                                            matches,
                                            (item) => item.extraInfo.scores
                                        ).map((o) => o._id),
                                ),
                                type
                            )
                        },
                    });

                    result.push({
                        name: `10f (2 >> 70) + 9f (${type}) ${name}`,
                        payload: {
                            callback: (matches) => The9thForecastFilter.doAnalysis(
                                matches,
                                (matches) => intersect(
                                    The9thForecastFilter
                                        .doFiltering(
                                            `${goalsCount}:${percents}:${sign}`,
                                            matches,
                                            (item) => item.extraInfo.scores
                                        ).map((o) => o._id),
                                    The10thForecastFilter
                                        .doFiltering(
                                            `2:70:>>`,
                                            matches,
                                            (item) => item.extraInfo.scores
                                        ).map((o) => o._id),
                                ),
                                type
                            )
                        },
                    });

                    result.push({
                        name: `10f (3 >> 60) + 9f (${type}) ${name}`,
                        payload: {
                            callback: (matches) => The9thForecastFilter.doAnalysis(
                                matches,
                                (matches) => intersect(
                                    The9thForecastFilter
                                        .doFiltering(
                                            `${goalsCount}:${percents}:${sign}`,
                                            matches,
                                            (item) => item.extraInfo.scores
                                        ).map((o) => o._id),
                                    The10thForecastFilter
                                        .doFiltering(
                                            `3:60:>>`,
                                            matches,
                                            (item) => item.extraInfo.scores
                                        ).map((o) => o._id),
                                ),
                                type
                            )
                        },
                    });

                    result.push({
                        name: `10f (3 >> 70) + 9f (${type}) ${name}`,
                        payload: {
                            callback: (matches) => The9thForecastFilter.doAnalysis(
                                matches,
                                (matches) => intersect(
                                    The9thForecastFilter
                                        .doFiltering(
                                            `${goalsCount}:${percents}:${sign}`,
                                            matches,
                                            (item) => item.extraInfo.scores
                                        ).map((o) => o._id),
                                    The10thForecastFilter
                                        .doFiltering(
                                            `3:70:>>`,
                                            matches,
                                            (item) => item.extraInfo.scores
                                        ).map((o) => o._id),
                                ),
                                type
                            )
                        },
                    });


                }
            }
        }
    }

    // create combined filters
    // for(const type of [
    //     The9thForecastFilter.ANALYSIS_TYPE_GT_2,
    //     The9thForecastFilter.ANALYSIS_TYPE_GT_2_AND_HALF
    // ]) {
    //     for(const sign of ['>', '>>']) {
    //         let goalsCount = 2;
    //         let percents = 20;
    //         const callback1 = callbacks.find(o => o.id === `${type}:${goalsCount}:${sign}:${percents}`);
    //         goalsCount += 1;
    //         // percents += 10;
    //         const callback2 = callbacks.find(o => o.id === `${type}:${goalsCount}:${sign}:${percents}`);
    //         if (!callback1 || !callback2) {
    //             continue;
    //         }
    //
    //         result.push({
    //             name: `9f (${type}) ${callback1.name}; ${callback2.name}`,
    //             payload: {
    //                 callback: (matches) => The9thForecastFilter.doAnalysis(
    //                     matches,
    //                     intersect(callback1.callback(matches), callback2.callback(matches)),
    //                     type
    //                 )
    //             },
    //         });
    //     }
    // }

    return result;
})());

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allTournamentsCount: 0,
            doneTournamentsCount: 0,
            currentTournamentName: '-',
        };
    }

    handleClick(tournamentType) {
        const sportType = App.SPORT_TYPE_FOOTBALL;

        let processTournament = async (tournaments) => {
            if (!tournaments.length){
                return;
            }

            let tournament = tournaments.shift();
            this.setState({
                currentTournamentName: tournament.tournamentName,
            });

            let matches = null;

            for (const filter of FILTERS) {
                if (await Request.isTournamentAnalysisItemExists(
                    sportType,
                    tournament.tournamentId,
                    filter.name
                )) {
                    continue;
                }

                if (matches === null) {
                    matches = await Request.getAllMatches(sportType, tournament.tournamentId);
                }

                if (!matches.length) {
                    break;
                }

                const firstItem = matches[0];

                // do filtering
                let [
                    positiveFilteredItemsIds,
                    negativeFilteredItemsIds,
                    neutralFilteredItemsIds
                ] = filter.payload.callback(matches);

                let positiveFilteredItemsCount = positiveFilteredItemsIds.length;
                let neutralFilteredItemsCount = neutralFilteredItemsIds.length;
                let negativeFilteredItemsCount = negativeFilteredItemsIds.length;
                let filteredItemsCount = positiveFilteredItemsCount
                    + neutralFilteredItemsCount
                    + negativeFilteredItemsCount;

                // save
                Request.createTournamentAnalysisItem({
                    tournamentId: firstItem.tournamentId,
                    tournamentName: firstItem.tournamentName,
                    sport: firstItem.sport,
                    isArchived: firstItem.isArchived,
                    filter: {
                        name: filter.name,
                        id: filter.name,
                    },
                    positiveFilteredItemsCount,
                    neutralFilteredItemsCount,
                    negativeFilteredItemsCount,
                    positiveFilteredItemsPercent: AnalysisTable.calculatePercents(
                        filteredItemsCount,
                        positiveFilteredItemsCount
                    ),
                    neutralFilteredItemsPercent: AnalysisTable.calculatePercents(
                        filteredItemsCount,
                        neutralFilteredItemsCount
                    ),
                    negativeFilteredItemsPercent: AnalysisTable.calculatePercents(
                        filteredItemsCount,
                        negativeFilteredItemsCount
                    ),
                    filteredItemsCount,
                    filteredItemsPercent: AnalysisTable.calculatePercents(
                        matches.length,
                        filteredItemsCount
                    ),
                    itemsCount: matches.length,
                });
            }

            this.setState((prevState) => ({
                doneTournamentsCount: prevState.doneTournamentsCount + 1,
            }));

            processTournament(tournaments);
        };

        Request.getTournamentsList(
            sportType,
            tournamentType === ARCHIVED_TOURNAMENTS
        ).then((tournaments) => {
            this.setState({
                allTournamentsCount: tournaments.length,
                doneTournamentsCount: 0,
                currentTournamentName: '-',
            });
            processTournament(tournaments);
        });
    }

    render() {
        return (
            <div>

                <h4>Tournaments Analysis Statistics</h4>

                <Button onClick={() => this.handleClick(CURRENT_TOURNAMENTS)}>
                    Calculate current tournaments
                </Button>

                <Button onClick={() => this.handleClick(ARCHIVED_TOURNAMENTS)}>
                    Calculate archived tournaments
                </Button>

                <h5>Tournament in process: {this.state.currentTournamentName}</h5>

                <Progress
                    indicating
                    value={this.state.doneTournamentsCount}
                    total={this.state.allTournamentsCount || 1}
                    progress='percent'
                    label={`${this.state.doneTournamentsCount}/${this.state.allTournamentsCount}`}
                />

            </div>
        );
    }
}