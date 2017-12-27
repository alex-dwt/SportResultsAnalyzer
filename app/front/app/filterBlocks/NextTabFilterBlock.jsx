import React from 'react';
import {render} from 'react-dom';
import { Button } from 'semantic-ui-react'
import { Grid } from 'semantic-ui-react'
import StrongerTeamFilter  from '../filters/StrongerTeamFilter.jsx'
import PositionsDiffMinFilter  from '../filters/PositionsDiffMinFilter.jsx'
import PositionsDiffMaxFilter  from '../filters/PositionsDiffMaxFilter.jsx'
import WinsDiffMinFilter  from '../filters/WinsDiffMinFilter.jsx'
import LossesDiffMinFilter  from '../filters/LossesDiffMinFilter.jsx'
import The5thForecastNoMinusesFilter  from '../filters/The5thForecastNoMinusesFilter.jsx'
import The5thForecastAllPlusesFilter  from '../filters/The5thForecastAllPlusesFilter.jsx'
import The1sForecastGoalsDiffMinFilter  from '../filters/The1sForecastGoalsDiffMinFilter.jsx'
const includes = require('array-includes');
const intersect = require('intersect');

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.filteredValues = {};
    }

    handleFilterClick() {
        let result = this.props.items.slice();

        if (Object.keys(this.filteredValues).length) {
            let ids = intersect(Object.values(this.filteredValues));
            result = result.filter((o) => includes(ids, o._id));
        }

        this.props.handleFilterClick(result);
    }

    handleFilterSelect(index, filteredItemsIds) {
        if (filteredItemsIds === null) {
            delete this.filteredValues[index];
        } else {
            this.filteredValues[index] = filteredItemsIds;
        }
    }

    render() {
        return (
            <div>

                <Grid divided>

                    <Grid.Column>
                        <StrongerTeamFilter
                            index="0"
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => this.props.payload[item.tournamentId].teams[`${item.homeTeamId}-${item.guestTeamId}`]}
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <PositionsDiffMinFilter
                            index="1"
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => Math.abs(this.props.payload[item.tournamentId].teams[`${item.homeTeamId}-${item.guestTeamId}`])}
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <PositionsDiffMaxFilter
                            index="2"
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => Math.abs(this.props.payload[item.tournamentId].teams[`${item.homeTeamId}-${item.guestTeamId}`])}
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <LossesDiffMinFilter
                            index="3"
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => Math.abs(
                                this.props.payload[item.tournamentId].tournamentResults.find((team) => team.teamId === item.homeTeamId).statistics.l -
                                this.props.payload[item.tournamentId].tournamentResults.find((team) => team.teamId === item.guestTeamId).statistics.l
                            )}
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <WinsDiffMinFilter
                            index="4"
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => Math.abs(
                                this.props.payload[item.tournamentId].tournamentResults.find((team) => team.teamId === item.homeTeamId).statistics.w -
                                this.props.payload[item.tournamentId].tournamentResults.find((team) => team.teamId === item.guestTeamId).statistics.w
                            )}
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <The5thForecastNoMinusesFilter
                            index="5"
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => item.scores}
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <The5thForecastAllPlusesFilter
                            index="6"
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => item.scores}
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <The1sForecastGoalsDiffMinFilter
                            index="7"
                            items={this.props.items}
                            onChange={this.handleFilterSelect.bind(this)}
                            payloadCallback={(item) => item.scores}
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