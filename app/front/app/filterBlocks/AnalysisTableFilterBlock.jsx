import React from 'react';
import { Grid } from 'semantic-ui-react'
import The5thForecastNoMinusesFilter  from '../filters/The5thForecastNoMinusesFilter.jsx'
import The5thForecastAllPlusesFilter  from '../filters/The5thForecastAllPlusesFilter.jsx'
const intersect = require('intersect');
import NextTabFilterBlock  from '../filterBlocks/NextTabFilterBlock.jsx'
import StrongerTeamFilter  from '../filters/StrongerTeamFilter.jsx'
import PositionsDiffMinFilter  from '../filters/PositionsDiffMinFilter.jsx'
import FilterButton  from './FilterButton.jsx'
import AnalysisTable from '../teamMatches/AnalysisTable.jsx';
import Request from '../Request.jsx';

const NO_MINUSES_FILTER_ID = 0;
const ALL_PLUSES_FILTER_ID = 1;
const STRONGER_TEAM_FILTER_ID = 2;
const POSITIONS_MIN_DIFF_FILTER_ID = 3;

export default class extends NextTabFilterBlock {
    handleFilterClick() {
        let positiveFilteredItemsIds = [];
        let negativeFilteredItemsIds = [];
        let neutralFilteredItemsIds = [];

        if (this.filteredValues.hasOwnProperty(NO_MINUSES_FILTER_ID)
            || this.filteredValues.hasOwnProperty(ALL_PLUSES_FILTER_ID)
        ) {
            let idsArr = [];
            for (const val of Object.values(this.filteredValues)) {
                idsArr.push(val.map((o) => o._id));
            }
            for (const id of intersect(idsArr)) {
                let item = this.props.items.find((o) => o._id === id);
                if (item) {
                    let strongerTeam = item
                        .extraInfo
                        .scores.find(o => o.forecastNum === 5)
                        .value.find(o => o.info.type === 'forecast1').info.strongerTeam;

                    if ((strongerTeam === 'home' && item.homeScore > item.guestScore) ||
                        (strongerTeam === 'guest' && item.homeScore < item.guestScore)
                    ) {
                        positiveFilteredItemsIds.push(item._id);
                    } else if (item.homeScore === item.guestScore) {
                        neutralFilteredItemsIds.push(item._id);
                    } else {
                        negativeFilteredItemsIds.push(item._id);
                    }
                }
            }

            // save results to DB
            if (this.props.items.length) {
                let firstItem = this.props.items[0];

                let positiveFilteredItemsCount = positiveFilteredItemsIds.length;
                let neutralFilteredItemsCount = neutralFilteredItemsIds.length;
                let negativeFilteredItemsCount = negativeFilteredItemsIds.length;
                let filteredItemsCount = positiveFilteredItemsCount
                    + neutralFilteredItemsCount
                    + negativeFilteredItemsCount;

                // Request.createTournamentAnalysisItem({
                //     tournamentId: firstItem.tournamentId,
                //     tournamentName: firstItem.tournamentName,
                //     sport: firstItem.sport,
                //     isArchived: firstItem.isArchived,
                //     enabledFiltersIds: Object.keys(this.filteredValues),
                //     positiveFilteredItemsCount,
                //     neutralFilteredItemsCount,
                //     negativeFilteredItemsCount,
                //     positiveFilteredItemsPercent: AnalysisTable.calculatePercents(filteredItemsCount, positiveFilteredItemsCount),
                //     neutralFilteredItemsPercent: AnalysisTable.calculatePercents(filteredItemsCount, neutralFilteredItemsCount),
                //     negativeFilteredItemsPercent: AnalysisTable.calculatePercents(filteredItemsCount, negativeFilteredItemsCount),
                //     filteredItemsCount,
                //     filteredItemsPercent: AnalysisTable.calculatePercents( this.props.items.length, filteredItemsCount),
                //     itemsCount: this.props.items.length,
                // });
            }
        }

        this.props.handleFilterClick(
            positiveFilteredItemsIds,
            negativeFilteredItemsIds,
            neutralFilteredItemsIds
        );
    }

    render() {
        return (
            <div className="analysis-table-filter-block">

                <Grid divided>

                    <Grid.Column>
                        <StrongerTeamFilter
                            index={STRONGER_TEAM_FILTER_ID}
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => item.extraInfo.positions.guestThen - item.extraInfo.positions.homeThen}
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <PositionsDiffMinFilter
                            index={POSITIONS_MIN_DIFF_FILTER_ID}
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => Math.abs(item.extraInfo.positions.homeThen - item.extraInfo.positions.guestThen)}
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <The5thForecastNoMinusesFilter
                            index={NO_MINUSES_FILTER_ID}
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => item.extraInfo.scores}
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <The5thForecastAllPlusesFilter
                            index={ALL_PLUSES_FILTER_ID}
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => item.extraInfo.scores}
                        />
                    </Grid.Column>

                </Grid>

                <FilterButton disabled={!this.props.items.length} onClick={() => this.handleFilterClick()}/>

            </div>
        );
    }
}