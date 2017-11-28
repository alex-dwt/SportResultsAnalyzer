import React from 'react';
import {render} from 'react-dom';
import axios from 'axios';
import { Button } from 'semantic-ui-react'
import { Table } from 'semantic-ui-react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { Dropdown } from 'semantic-ui-react'
import ScoreTable from './ScoreTable.jsx';
import MatchForecastsOverall from './MatchForecastsOverall.jsx';
import BookmakerStatsTable from './BookmakerStatsTable.jsx';
import { Tab } from 'semantic-ui-react'
import { Grid, Image } from 'semantic-ui-react'

import 'react-datepicker/dist/react-datepicker.css';

axios.interceptors.request.use((config) => {
    let params = config.params || {};
    params.password = getParameterByName('password');
    params.timestamp = + new Date();
    params.dateFrom = '2000-01-01';
    params.dateTill = '2020-12-31';

    return {...config, params};
});

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: moment(),
            tournaments: [{ key: '-', value: '-', text: '-' }],
            matchesData: {
                items: []
            }
        };
        this.filters = {
            strongerTeam: getFilterItems([
                { key: 'home', value: 'home', text: 'Home' },
                { key: 'guest', value: 'guest', text: 'Guest' },
            ]),
        };
    }

    handleClick() {
        axios
            .get('http://localhost/next-matches/soccer?date=' + this.state.date.format('YYYY-MM-DD'))
            .then((res) => {
                let ids = [];
                this.setState({
                    matchesData: res.data,
                    tournaments: [{ key: '-', value: '-', text: '-' }]
                        .concat(
                            res.data.items
                                .map((item) => ({
                                    key: item.tournamentId,
                                    value: item.tournamentId,
                                    text: item.tournamentName,
                                }))
                                .filter((item) => {
                                    let res = !ids.includes(item.key);
                                    ids.push(item.key);
                                    return res;
                                })
                        ),
                })
            })
        ;
    }

    handleChangeDate(date) {
        this.setState({
            date: date
        });
    }

    render() {
        return (
            <div>
                <div className={'next-match-div'}>
                    <Grid columns={3} divided>
                        <Grid.Row>
                            <Grid.Column>
                                <DatePicker locale="ru" selected={this.state.date} onChange={(e) => this.handleChangeDate(e)}/>
                                <Button onClick={(e) => this.handleClick(e)}>Load</Button>
                                <p>Total matches: {this.state.matchesData.items.length}</p>
                            </Grid.Column>
                            <Grid.Column>
                                <p>Which team is stronger</p>
                                <Dropdown selection options={this.filters.strongerTeam} defaultValue="-"/>
                            </Grid.Column>
                            <Grid.Column>
                                <Dropdown placeholder='Tournament' search selection options={this.state.tournaments} defaultValue="-" />
                            </Grid.Column>
                        </Grid.Row>

                        <Grid.Row>
                            <Grid.Column>
                            </Grid.Column>
                            <Grid.Column>
                            </Grid.Column>
                            <Grid.Column>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>

                {this.state.matchesData.items.map((item, index) => {
                    let teamsVar = item.homeTeamId + '-' + item.guestTeamId;
                    return (
                        <div key={item._id} className={'next-match-div'}>
                            <p style={{marginTop: '10px', fontWeight: 'bold'}}>
                                Match #{index +1} of {this.state.matchesData.items.length}
                            </p>


                            <Grid columns={5} stretched divided textAlign={'center'} verticalAlign={'middle'} className={'next-match-grid'}>
                                <Grid.Row>
                                    <Grid.Column width={1}>
                                        <span className={'make-favorite-game-sign icon-star' + (item.isFavorite ? '' : '-empty')}></span>
                                    </Grid.Column>
                                    <Grid.Column>
                                        {item.tournamentName}<br/>
                                        {item.date.slice(0, 10)} {item.time}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {item.homeTeamName}<br/>
                                        {this.state.matchesData.statistics[item.tournamentId].tournamentResults.filter((team) => team.teamId === item.homeTeamId)[0].statistics.serial.join(' ').toUpperCase()}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {item.guestTeamName}<br/>
                                        {this.state.matchesData.statistics[item.tournamentId].tournamentResults.filter((team) => team.teamId === item.guestTeamId)[0].statistics.serial.join(' ').toUpperCase()}
                                    </Grid.Column>
                                    <Grid.Column width={1}>
                                        <span className={'team-position'}>
                                            {this.state.matchesData.statistics[item.tournamentId].teams[teamsVar]}/{this.state.matchesData.statistics[item.tournamentId].tournamentResults.length}
                                        </span>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>

                            <Tab panes={[
                                { menuItem: 'Total', pane: {
                                    key: item._id + '-tab1',
                                    content: (
                                        <div>
                                            <BookmakerStatsTable data={item.bookmakersStats}/>
                                            <MatchForecastsOverall forecasts={item.scores}/>
                                            <ScoreTable
                                                activeRows={{[item.homeTeamId]: "home", [item.guestTeamId]: "guest"}}
                                                items={this.state.matchesData.statistics[item.tournamentId].tournamentResults.filter(
                                                    (team) => team.teamId === item.homeTeamId || team.teamId === item.guestTeamId
                                                )}
                                            />
                                        </div>
                                    )
                                }},
                                { menuItem: 'Score Table', pane: {
                                    key: item._id + '-tab2',
                                    content: (
                                        <ScoreTable
                                            activeRows={{[item.homeTeamId]: "whole", [item.guestTeamId]: "whole"}}
                                            items={this.state.matchesData.statistics[item.tournamentId].tournamentResults}
                                        />
                                    )
                                }},
                            ]} renderActiveOnly={false} />

                        </div>
                        );
                    }
                )}

            </div>
        );
    }
}

function getFilterItems(items) {
    return [{ key: '-', value: '-', text: '-' }].concat(items);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}