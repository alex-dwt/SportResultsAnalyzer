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
                <DatePicker
                    locale="ru"
                    selected={this.state.date}
                    onChange={(e) => this.handleChangeDate(e)}
                />

                <Button onClick={(e) => this.handleClick(e)}>
                    Load
                </Button>

                <Dropdown placeholder='Tournament' search selection options={this.state.tournaments} defaultValue="-" />

                <p>Total matches: {this.state.matchesData.items.length}</p>

                {this.state.matchesData.items.map((item) => {
                    let teamsVar = item.homeTeamId + '-' + item.guestTeamId;
                    return (
                        <div key={item._id} style={{marginBottom: '40px'}}>
                            <Table fixed>
                                <Table.Body>

                                    <Table.Row>
                                        <Table.Cell style={{width: '50px'}}>
                                            <span className={'make-favorite-game-sign icon-star' + (item.isFavorite ? '' : '-empty')}></span>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {item.tournamentName}<br/>
                                            {item.date.slice(0, 10)} {item.time}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {item.homeTeamName}<br/>
                                            {this.state.matchesData.statistics[item.tournamentId].teams[item.homeTeamId].statistics.serial.join(' ').toUpperCase()}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {item.guestTeamName}<br/>
                                            {this.state.matchesData.statistics[item.tournamentId].teams[item.guestTeamId].statistics.serial.join(' ').toUpperCase()}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span className={'team-position'}>
                                                {this.state.matchesData.statistics[item.tournamentId].teams[teamsVar]}
                                                /
                                                {this.state.matchesData.statistics[item.tournamentId]['positionsCount']}
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell style={{width: '390px'}}>
                                            <MatchForecastsOverall forecasts={item.scores}/>
                                        </Table.Cell>
                                    </Table.Row>

                                    <Table.Row>
                                        <Table.Cell colSpan='6'>
                                            <ScoreTable
                                                activeRows={{
                                                    [item.homeTeamId]: "home",
                                                    [item.guestTeamId]: "guest"
                                                }}
                                                items={[
                                                    this.state.matchesData.statistics[item.tournamentId].teams[item.homeTeamId],
                                                    this.state.matchesData.statistics[item.tournamentId].teams[item.guestTeamId],
                                                ].sort((a, b) => a.position - b.position)}
                                            />
                                        </Table.Cell>
                                    </Table.Row>

                                </Table.Body>
                            </Table>

                            <BookmakerStatsTable data={item.bookmakersStats}/>
                        </div>
                        );
                    }
                )}

            </div>
        );
    }
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