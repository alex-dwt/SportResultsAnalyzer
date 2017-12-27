import React from 'react';
import { Button } from 'semantic-ui-react'
import { Grid } from 'semantic-ui-react'
import The5thForecastNoMinusesFilter  from '../filters/The5thForecastNoMinusesFilter.jsx'
import The5thForecastAllPlusesFilter  from '../filters/The5thForecastAllPlusesFilter.jsx'
const includes = require('array-includes');
const intersect = require('intersect');
import NextTabFilterBlock  from '../filterBlocks/NextTabFilterBlock.jsx'

export default class extends NextTabFilterBlock {
    // handleFilterClick() {
    //     let result = this.props.items.slice();
    //
    //     if (Object.keys(this.filteredValues).length) {
    //         let ids = intersect(Object.values(this.filteredValues));
    //         result = result.filter((o) => includes(ids, o._id));
    //     }

    //     additionalFilterCallback={
    //     (items) => {
    //         let result = [];
    //
    //         for (const item of items) {
    //             let strongerTeam = item
    //                 .extraInfo
    //                 .scores.find(o => o.forecastNum === 5)
    //                 .value.find(o => o.info.type === 'forecast1').info.strongerTeam;
    //
    //             if ((strongerTeam === 'home' && item.homeScore > item.guestScore) ||
    //                 (strongerTeam === 'guest' && item.homeScore < item.guestScore)
    //             ) {
    //                 result.push(item);
    //             }
    //         }
    //
    //         return result;
    //     }
    // }

        // this.props.handleFilterClick(result);
    // }

    render() {
        return (
            <div className="analysis-table-filter-block">

                <Grid divided>

                    <Grid.Column>
                        <The5thForecastNoMinusesFilter
                            index="0"
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => item.extraInfo.scores}
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <The5thForecastAllPlusesFilter
                            index="1"
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => item.extraInfo.scores}
                        />
                    </Grid.Column>

                </Grid>

                <Button  style={{marginTop: '10px'}} onClick={(e) => this.handleFilterClick(e)}>
                    Filter
                </Button>

            </div>
        );
    }
}