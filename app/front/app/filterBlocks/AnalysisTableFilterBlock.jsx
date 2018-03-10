import React from 'react';
import { Grid } from 'semantic-ui-react'
import The5thForecastNoMinusesFilter  from '../filters/The5thForecastNoMinusesFilter.jsx'
import The5thForecastAllPlusesFilter  from '../filters/The5thForecastAllPlusesFilter.jsx'
const intersect = require('intersect');
import NextTabFilterBlock  from '../filterBlocks/NextTabFilterBlock.jsx'
import StrongerTeamFilter  from '../filters/StrongerTeamFilter.jsx'
import PositionsDiffMinFilter  from '../filters/PositionsDiffMinFilter.jsx'
import The6thForecastTotalCalculatedFilter  from '../filters/The6thForecastTotalCalculatedFilter.jsx'
import {The9thForecastFilter}  from '../filters/The9thForecastFilter.jsx'
import FilterButton  from './FilterButton.jsx'
import MaxSerialFilter  from '../filters/MaxSerialFilter.jsx'
import MinSerialFilter  from '../filters/MinSerialFilter.jsx'

const NO_MINUSES_FILTER_ID = 0;
const ALL_PLUSES_FILTER_ID = 1;
const STRONGER_TEAM_FILTER_ID = 2;
const POSITIONS_MIN_DIFF_FILTER_ID = 3;
const MIN_SERIAL_FILTER_ID = 4;
const MAX_SERIAL_FILTER_ID = 5;
const TOTAL_CALCULATED_FILTER_ID = 6;
const TOTAL_PROBABILITY_FILTER_ID = 7;

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
            [
                positiveFilteredItemsIds,
                negativeFilteredItemsIds,
                neutralFilteredItemsIds
            ] = this.constructor.doFiltering(
                this.props.items,
                intersect(idsArr)
            );
        // } else if (this.filteredValues.hasOwnProperty(TOTAL_CALCULATED_FILTER_ID)) {
        //     positiveFilteredItemsIds = this.filteredValues[TOTAL_CALCULATED_FILTER_ID].map((o) => o._id);
        } else if (this.filteredValues.hasOwnProperty(TOTAL_PROBABILITY_FILTER_ID)) {
            let ids = this.filteredValues[TOTAL_PROBABILITY_FILTER_ID].map((o) => o._id);
            if (this.filteredValues.hasOwnProperty(TOTAL_CALCULATED_FILTER_ID)) {
                ids = intersect([
                    ids,
                    this.filteredValues[TOTAL_CALCULATED_FILTER_ID].map((o) => o._id)
                ]);
            }

            [
                positiveFilteredItemsIds,
                negativeFilteredItemsIds,
                neutralFilteredItemsIds
            ] = The9thForecastFilter.doAnalysis(
                this.props.items,
                ids
            );
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

                    <Grid.Column>
                        <MinSerialFilter
                            index={MIN_SERIAL_FILTER_ID}
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => item.extraInfo.scores}
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <MaxSerialFilter
                            index={MAX_SERIAL_FILTER_ID}
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => item.extraInfo.scores}
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <The6thForecastTotalCalculatedFilter
                            index={TOTAL_CALCULATED_FILTER_ID}
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => item.extraInfo.scores}
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <The9thForecastFilter
                            index={TOTAL_PROBABILITY_FILTER_ID}
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

    static doFiltering(matches, filteredIds) {
        let positiveFilteredItemsIds = [];
        let negativeFilteredItemsIds = [];
        let neutralFilteredItemsIds = [];

        for (const id of filteredIds) {
            let item = matches.find((o) => o._id === id);
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

        return [
            positiveFilteredItemsIds,
            negativeFilteredItemsIds,
            neutralFilteredItemsIds,
        ];
    }
}