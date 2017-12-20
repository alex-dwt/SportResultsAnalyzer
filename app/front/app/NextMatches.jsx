import React from 'react';
import {render} from 'react-dom';
import axios from 'axios';
import { Button } from 'semantic-ui-react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { Dropdown } from 'semantic-ui-react'
import ScoreTable from './ScoreTable.jsx';
import MatchForecastsOverall from './MatchForecastsOverall.jsx';
import BookmakerStatsTable from './BookmakerStatsTable.jsx';
import TeamMatchesTable from './teamMatches/TeamMatchesTable.jsx';
import { Tab } from 'semantic-ui-react'
import { Grid } from 'semantic-ui-react'

import 'react-datepicker/dist/react-datepicker.css';

axios.interceptors.request.use((config) => {
    let params = config.params || {};
    params.password = getParameterByName('password');
    params.timestamp = + new Date();
    params.dateFrom = '2000-01-01';
    params.dateTill = '2020-12-31';

    return {...config, params};
});

const TEAM_MATCHES_TAB_ID = 2;

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: moment(),
            filteredItems: [],
            itemsCount: 0,
            teamsMatches: [],
        };

        this.matchesData = {
            items: [],
        };
        this.filters = [
            {
                label: 'Which team is stronger',
                values: getFilterItems([
                    { value: 'home', text: 'Home' },
                    { value: 'guest', text: 'Guest' },
                ]),
                filterCallback: (itemToFilter, value) => {
                    let key = `${itemToFilter.homeTeamId}-${itemToFilter.guestTeamId}`;

                    return (
                        (value === 'home' && this.matchesData.statistics[itemToFilter.tournamentId].teams[key] > 0) ||
                        (value === 'guest' && this.matchesData.statistics[itemToFilter.tournamentId].teams[key] < 0)
                    );
                },
                value: '',
            },
            {
                label: 'Positions difference (min)',
                values: generateDigitsFilterValues(30),
                filterCallback: (itemToFilter, value) => {
                    return Math.abs(this.matchesData.statistics[itemToFilter.tournamentId].teams[`${itemToFilter.homeTeamId}-${itemToFilter.guestTeamId}`]) >= value;
                },
                value: '',
            },
            {
                label: 'Positions difference (max)',
                values: generateDigitsFilterValues(30),
                filterCallback: (itemToFilter, value) => {
                    return Math.abs(this.matchesData.statistics[itemToFilter.tournamentId].teams[`${itemToFilter.homeTeamId}-${itemToFilter.guestTeamId}`]) <= value;
                },
                value: '',
            },
            {
                label: 'Wins difference (min)',
                values: generateDigitsFilterValues(30),
                filterCallback: (itemToFilter, value) => {
                    return Math.abs(
                        this.matchesData.statistics[itemToFilter.tournamentId].tournamentResults.filter((team) => team.teamId === itemToFilter.homeTeamId)[0].statistics.w -
                        this.matchesData.statistics[itemToFilter.tournamentId].tournamentResults.filter((team) => team.teamId === itemToFilter.guestTeamId)[0].statistics.w
                    ) >= value;
                },
                value: '',
            },
            {
                label: 'Losses difference (min)',
                values: generateDigitsFilterValues(30),
                filterCallback: (itemToFilter, value) => {
                    return Math.abs(
                        this.matchesData.statistics[itemToFilter.tournamentId].tournamentResults.filter((team) => team.teamId === itemToFilter.homeTeamId)[0].statistics.l -
                        this.matchesData.statistics[itemToFilter.tournamentId].tournamentResults.filter((team) => team.teamId === itemToFilter.guestTeamId)[0].statistics.l
                    ) >= value;
                },
                value: '',
            },
            {
                label: 'First forecast goals difference (min)',
                values: (() => {
                    let values = [];
                    for (let i = 2; i <= 3; i++) {
                        let j = 0;
                        while (j < 2) {
                            j = Math.round((j + 0.05) * 100) / 100;
                            values.push({
                                value: `${i}:${j}`,
                                text: `${j} (${i})`
                            });
                        }
                    }

                    return getFilterItems(values);
                })(),
                filterCallback: (itemToFilter, value) => {
                    value = value.split(':');
                    let scores = itemToFilter.scores.find(o => o.forecastNum === 1).value;
                    for (let i = 2; i <= value[0]; i++) {
                        let val = scores.find(o => o.info.matchesCount === i);
                        if (!val) {
                            return false;
                        }
                        let score1 = val.info.homeScore > 0 ? val.info.homeScore : 0;
                        let score2 = val.info.guestScore > 0 ? val.info.guestScore : 0;
                        if (Math.abs(Math.round((score1 - score2) * 100) / 100) < value[1]) {
                            return false;
                        }
                    }

                    return true;
                },
                value: '',
            },
            {
                label: '5 forecast all "+"',
                values: getFilterItems([
                    { value: 'yes', text: 'Yes' },
                ]),
                filterCallback: (itemToFilter, value) => {
                    for(const item of itemToFilter.scores.find(o => o.forecastNum === 5).value) {
                        if (item.info.isPassed !== '+') {
                            return false;
                        }
                    }

                    return true;
                },
                value: '',
            },
            {
                label: '5 forecast no "-"',
                values: getFilterItems([
                    { value: 'yes', text: 'Yes' },
                ]),
                filterCallback: (itemToFilter, value) => {
                    for(const item of itemToFilter.scores.find(o => o.forecastNum === 5).value) {
                        if (item.info.isPassed === '-') {
                            return false;
                        }
                    }

                    return true;
                },
                value: '',
            },
        ];
    }

    handleClick() {
        axios
            .get('/next-matches/soccer?date=' + this.state.date.format('YYYY-MM-DD'))
            .then((res) => {
                this.matchesData = res.data;
                this.setState({
                    filteredItems: this.matchesData.items,
                    itemsCount: this.matchesData.items.length,
                });
            });
    }

    handleFilterClick() {
        let filteredItems = this.matchesData.items;
        for(const filter of this.filters) {
            filteredItems = filteredItems.filter(item => filter.value ? filter.filterCallback(item, filter.value) : true);
        }
        this.setState({filteredItems});
    }

    handleFilterOnChange(value, index) {
        this.filters[index].value = value;
    }

    handleChangeDate(date) {
        this.setState({
            date: date
        });
    }

    handleChangeTab(e, data, item) {
        if (data.activeIndex === TEAM_MATCHES_TAB_ID) {
            for (const type of ['home', 'guest']) {
                let teamId = item[`${type}TeamId`];
                if (!this.state.teamsMatches.find((o) => o.teamId === teamId)) {
                    axios
                        .get(`/team-matches-table/${item.sport}/${item.tournamentId}/${teamId}`)
                        .then((res) => {
                            this.setState((prevState) => ({
                                teamsMatches: prevState.teamsMatches.concat([{
                                    teamId,
                                    matches: res.data
                                }])
                            }));
                        });
                }
            }
        }
    }

    render() {
        return (
            <div>
                <div className={'next-match-div'}>
                    <Grid divided>
                            <Grid.Column>
                                <DatePicker locale="ru" selected={this.state.date} onChange={(e) => this.handleChangeDate(e)}/>
                                <Button onClick={(e) => this.handleClick(e)}>Load</Button>
                                <Button onClick={(e) => this.handleFilterClick(e)}>Filter</Button>
                                <p>Total matches: {this.state.itemsCount}</p>
                                <p>Filtered matches: {this.state.filteredItems.length}</p>
                            </Grid.Column>

                            {this.filters.map((filter, index) => {
                                return (
                                    <Grid.Column key={index}>
                                        <p>{filter.label}</p>
                                        <Dropdown
                                            selection
                                            options={filter.values}
                                            defaultValue="-"
                                            onChange={(e, { value }) => this.handleFilterOnChange(value, index)}
                                        />
                                    </Grid.Column>
                                );
                            })}
                    </Grid>
                </div>

                {this.state.filteredItems.map((item, index) => {
                    let teamsVar = item.homeTeamId + '-' + item.guestTeamId;
                    return (
                        <div key={item._id} className={'next-match-div-one-match'}>
                            <p style={{marginTop: '10px', fontWeight: 'bold'}}>
                                Match #{index +1} of {this.state.filteredItems.length}
                            </p>

                            <Grid columns={5} divided textAlign={'center'} verticalAlign={'middle'} className={'next-match-grid'}>
                                <Grid.Row>
                                    <Grid.Column style={{'width': '10%'}}>
                                        <span className={'make-favorite-game-sign icon-star' + (item.isFavorite ? '' : '-empty')}></span>
                                    </Grid.Column>
                                    <Grid.Column style={{'width': '30%'}}>
                                        {item.tournamentName}<br/>
                                        {item.date.slice(0, 10)} {item.time}
                                    </Grid.Column>
                                    <Grid.Column style={{'width': '25%'}}>
                                        {item.homeTeamName}<br/>
                                        {this.matchesData.statistics[item.tournamentId].tournamentResults.filter((team) => team.teamId === item.homeTeamId)[0].statistics.serial.join(' ').toUpperCase()}
                                    </Grid.Column>
                                    <Grid.Column style={{'width': '25%'}}>
                                        {item.guestTeamName}<br/>
                                        {this.matchesData.statistics[item.tournamentId].tournamentResults.filter((team) => team.teamId === item.guestTeamId)[0].statistics.serial.join(' ').toUpperCase()}
                                    </Grid.Column>
                                    <Grid.Column style={{'width': '10%'}}>
                                        <span className={'team-position'}>
                                            {this.matchesData.statistics[item.tournamentId].teams[teamsVar]}/{this.matchesData.statistics[item.tournamentId].tournamentResults.length}
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
                                                items={this.matchesData.statistics[item.tournamentId].tournamentResults.filter(
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
                                            items={this.matchesData.statistics[item.tournamentId].tournamentResults}
                                        />
                                    )
                                }},
                                { menuItem: 'Teams Matches', pane: {
                                    key: item._id + '-tab3',
                                    content: (
                                        <div style={{'display': 'flex'}}>
                                            <div style={{'marginRight': '30px'}}>
                                                <TeamMatchesTable
                                                    items={this.state.teamsMatches.reduce((result, o) => o.teamId === item.homeTeamId ? o.matches : result, [])}
                                                    teamId={item.homeTeamId}
                                                    teamName={item.homeTeamName}
                                                />
                                            </div>
                                            <div style={{'marginLeft': '30px'}}>
                                                <TeamMatchesTable
                                                    items={this.state.teamsMatches.reduce((result, o) => o.teamId === item.guestTeamId ? o.matches : result, [])}
                                                    teamId={item.guestTeamId}
                                                    teamName={item.guestTeamName}
                                                />
                                            </div>
                                        </div>
                                    )
                                }},
                            ]} renderActiveOnly={false} onTabChange={(e, data) => this.handleChangeTab(e, data, item)}/>

                        </div>
                        );
                    }
                )}

            </div>
        );
    }
}

function getFilterItems(items) {
    return [{ value: '', text: '' }].concat(items).map((o) => ({...o, key: o.value || '-'}));
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

function generateDigitsFilterValues(count) {
    let items = [];
    for (let i = 1; i <= count; i++) {
        items.push({ value: i, text: i })
    }

    return getFilterItems(items);
}
