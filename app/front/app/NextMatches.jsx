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
            filteredItems: [],
            itemsCount: 0
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
        let isChanged = false;
        for(const filter of this.filters) {
            if (filter.value) {
                filteredItems = filteredItems.filter(item => filter.filterCallback(item, filter.value));
                isChanged = true;
            }
        }
        if (isChanged) {
            this.setState({filteredItems});
        }
    }

    handleFilterOnChange(value, index) {
        this.filters[index].value = value;
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

                            <Grid.Column>
                                <Button onClick={(e) => this.handleFilterClick(e)}>Filter</Button>
                            </Grid.Column>
                        </Grid.Row>

                    </Grid>
                </div>

                {this.state.filteredItems.map((item, index) => {
                    let teamsVar = item.homeTeamId + '-' + item.guestTeamId;
                    return (
                        <div key={item._id} className={'next-match-div'}>
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