import React from 'react';
import { Button, Progress } from 'semantic-ui-react'
import Request  from './Request.jsx'
import { App } from './index.jsx'
import AnalysisTable  from './teamMatches/AnalysisTable.jsx'
import AnalysisTableFilterBlock  from './filterBlocks/AnalysisTableFilterBlock.jsx'
import The5thForecastAllPlusesFilter  from './filters/The5thForecastAllPlusesFilter.jsx'
import The5thForecastNoMinusesFilter  from './filters/The5thForecastNoMinusesFilter.jsx'

const CURRENT_TOURNAMENTS = 'current';
const ARCHIVED_TOURNAMENTS = 'archived';
const FILTERS = [
    {
        name: '5f no minuses;',
        payload: {
            callback: (matches) => AnalysisTableFilterBlock.doFiltering(
                matches,
                The5thForecastNoMinusesFilter.doFiltering(
                    matches,
                    (item) => item.extraInfo.scores
                ).map((o) => o._id)
            ),
        },
    },
    {
        name: '5f all pluses;',
        payload: {
            callback: (matches) => AnalysisTableFilterBlock.doFiltering(
                matches,
                The5thForecastAllPlusesFilter.doFiltering(
                    matches,
                    (item) => item.extraInfo.scores
                ).map((o) => o._id)
            ),
        },
    },
    // {
    //     name: '5f no minuses; min pos diff 3;',
    //     payload: {},
    // },
    // {
    //     name: '5f all pluses; min pos diff 3;',
    //     payload: {},
    // },
];

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

        let processTournament = (tournaments) => {
            if (!tournaments.length){
                return;
            }

            let tournament = tournaments.shift();
            this.setState({
                currentTournamentName: tournament.tournamentName,
            });

            Request
                .isTournamentAnalysisItemExists(sportType, tournament.tournamentId)
                .then((isExists) => {
                    if (isExists) {
                        this.setState((prevState) => ({
                            doneTournamentsCount: prevState.doneTournamentsCount + 1,
                        }));
                        processTournament(tournaments);
                    } else {
                        Request
                            .getAllMatches(sportType, tournament.tournamentId)
                            .then((matches) => {
                                if (matches.length) {
                                    let firstItem = matches[0];

                                    for (const [filterIndex, filter] of FILTERS.entries()) {
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
                                                id: filterIndex,
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
                                }
                            });
                    }
                });
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