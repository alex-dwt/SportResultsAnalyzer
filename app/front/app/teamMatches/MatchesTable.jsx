import React from 'react';
import {render} from 'react-dom';
import { Table } from 'semantic-ui-react'
import TeamMatchesTableTeamCell from './TeamMatchesTableTeamCell.jsx';
import TeamMatchesTableScoreCell from './TeamMatchesTableScoreCell.jsx';
import { Dropdown } from 'semantic-ui-react'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            teamId: '',
        };
    }

    render() {
        return (
            <div>

                <div>
                    <p style={{'marginBottom': '5px'}}>Team</p>
                    <Dropdown
                        style={{'width': '30%'}}
                        selection
                        options={
                            [{ value: '', text: '' }]
                                .concat(this.props.teams.map((t) => ({value: t.teamId, text: t.teamName})))
                                .map((o) => ({...o, key: o.value}))
                        }
                        onChange={(e, { value }) => this.setState({teamId: value})}
                    />
                </div>

                <Table fixed>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Date</Table.HeaderCell>
                            <Table.HeaderCell>Home Team</Table.HeaderCell>
                            <Table.HeaderCell>Score</Table.HeaderCell>
                            <Table.HeaderCell>Guest Team</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.props.items.map((item) => {
                            if (
                                !this.state.teamId ||
                                (
                                    this.state.teamId &&
                                    (
                                        this.state.teamId === item.homeTeamId ||
                                        this.state.teamId === item.guestTeamId
                                    )
                                )
                            ) {
                                return (
                                    <Table.Row key={item._id}>
                                        <Table.Cell>{item.date.slice(0, 10)}</Table.Cell>
                                        <TeamMatchesTableTeamCell
                                            marksAsBold={this.state.teamId === item.homeTeamId}
                                            serial={[]}
                                            currentPosition={item.extraInfo.positions.homeCurrent}
                                            thenPosition={item.extraInfo.positions.homeThen}
                                            name={item.homeTeamName}
                                        />
                                        <TeamMatchesTableScoreCell
                                            homeScore={item.homeScore}
                                            guestScore={item.guestScore}
                                            total={item.totalScore}
                                        />
                                        <TeamMatchesTableTeamCell
                                            marksAsBold={this.state.teamId === item.guestTeamId}
                                            serial={[]}
                                            currentPosition={item.extraInfo.positions.guestCurrent}
                                            thenPosition={item.extraInfo.positions.guestThen}
                                            name={item.guestTeamName}
                                        />
                                    </Table.Row>
                                );
                            } else {
                                return null;
                            }
                        })}
                    </Table.Body>
                </Table>
            </div>
        );
    }
}