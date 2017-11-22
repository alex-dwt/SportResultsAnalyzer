import React from 'react';
import {render} from 'react-dom';
import axios from 'axios';
import { Button } from 'semantic-ui-react'
import { Table } from 'semantic-ui-react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { Dropdown } from 'semantic-ui-react'

// stateOptions = [ { key: 'AL', value: 'AL', text: 'Alabama' }, ...  ]


import 'react-datepicker/dist/react-datepicker.css';

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
            .get('http://localhost/next-matches/soccer?password=password&dateFrom=2000-01-01&dateTill=2017-12-31&date=' + this.state.date.format('YYYY-MM-DD'))
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

                {this.state.matchesData.items.map((item) =>
                    <div key={item._id} style={{marginBottom: '5px'}}>
                        <Table fixed>
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell>{item.tournamentName}</Table.Cell>
                                    <Table.Cell>{item.date.slice(0, 10)} {item.time}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>{item.homeTeamName}</Table.Cell>
                                    <Table.Cell>{item.guestTeamName}</Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    </div>
                )}


            </div>
        );
    }
}