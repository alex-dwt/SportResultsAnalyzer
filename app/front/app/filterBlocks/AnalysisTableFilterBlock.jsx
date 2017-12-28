import React from 'react';
import { Button } from 'semantic-ui-react'
import { Grid } from 'semantic-ui-react'
import The5thForecastNoMinusesFilter  from '../filters/The5thForecastNoMinusesFilter.jsx'
import The5thForecastAllPlusesFilter  from '../filters/The5thForecastAllPlusesFilter.jsx'
const includes = require('array-includes');
const intersect = require('intersect');
import NextTabFilterBlock  from '../filterBlocks/NextTabFilterBlock.jsx'

const NO_MINUSES_FILTER_ID = 0;
const ALL_PLUSES_FILTER_ID = 1;

export default class extends NextTabFilterBlock {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            errorMessage: ''
        };
    }

    handleFilterClick() {
        this.setState({errorMessage:''});

        let positiveFilteredItemsIds = [];
        let negativeFilteredItemsIds = [];
        let neutralFilteredItemsIds = [];

        if (Object.keys(this.filteredValues).length) {
            if (this.filteredValues.hasOwnProperty(NO_MINUSES_FILTER_ID)
                && this.filteredValues.hasOwnProperty(ALL_PLUSES_FILTER_ID)
            ) {
                this.setState({
                    errorMessage: 'You can not use filters "5 forecast no "-"" and "5 forecast all "+"" together'
                });

                return;
            }

            let items = [];
            if (this.filteredValues.hasOwnProperty(NO_MINUSES_FILTER_ID)) {
                items = this.filteredValues[NO_MINUSES_FILTER_ID];
            } else if (this.filteredValues.hasOwnProperty(ALL_PLUSES_FILTER_ID)) {
                items = this.filteredValues[ALL_PLUSES_FILTER_ID];
            }

            for (const item of items) {
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

                <p style={{color: 'red', marginTop: '10px'}}>{this.state.errorMessage}</p>

                <Button  style={{marginTop: '10px'}} onClick={(e) => this.handleFilterClick(e)}>
                    Filter
                </Button>

            </div>
        );
    }
}