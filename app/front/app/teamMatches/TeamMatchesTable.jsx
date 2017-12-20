import React from 'react';
import {render} from 'react-dom';
import { Table } from 'semantic-ui-react'
import TeamMatchesTableTeamCell from './TeamMatchesTableTeamCell.jsx';
import TeamMatchesTableScoreCell from './TeamMatchesTableScoreCell.jsx';

export default class extends React.Component {
    render() {
        let teamId = this.props.teamId;

        let winsAtHomeCount = 0;
        let winsAtGuestCount = 0;
        let losesAtHomeCount = 0;
        let losesAtGuestCount = 0;
        let drawsAtHomeCount = 0;
        let drawsAtGuestCount = 0;

        this.props.items.map((item) => {
            let res = 0;
            if (teamId === item.homeTeamId) {
                res = item.homeScore - item.guestScore;
            } else {
                res = item.guestScore - item.homeScore;
            }

            if (res > 0) {
                if (teamId === item.homeTeamId) {
                    winsAtHomeCount++;
                } else {
                    winsAtGuestCount++;
                }
            } else if (!res) {
                if (teamId === item.homeTeamId) {
                    drawsAtHomeCount++;
                } else {
                    drawsAtGuestCount++;
                }
            } else {
                if (teamId === item.homeTeamId) {
                    losesAtHomeCount++;
                } else {
                    losesAtGuestCount++;
                }
            }
        });

        return (
            <div>
                <p style={{'textAlign':'center'}}>{this.props.teamName}</p>
                <p>At home: {winsAtHomeCount} (W) / {drawsAtHomeCount} (D) / {losesAtHomeCount} (L)</p>
                <p>At guest: {winsAtGuestCount} (W) / {drawsAtGuestCount} (D) / {losesAtGuestCount} (L)</p>
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
                            let res = 0;
                            if (teamId === item.homeTeamId) {
                                res = item.homeScore - item.guestScore;
                            } else {
                                res = item.guestScore - item.homeScore;
                            }

                            return (
                                <Table.Row key={item._id} className={res > 0 ? 'row-success' : (res < 0 ? 'row-danger' : '')}>
                                    <Table.Cell>{item.date.slice(0, 10)}</Table.Cell>
                                    <TeamMatchesTableTeamCell
                                        marksAsBold={teamId === item.homeTeamId}
                                        serial={[]}
                                        currentPosition={item.extraInfo.positions.homeCurrent}
                                        thenPosition={item.extraInfo.positions.homeThen}
                                        name={item.homeTeamName}
                                    />
                                    <TeamMatchesTableScoreCell
                                        homeScore={item.homeScore}
                                        guestScore={item.guestScore}
                                    />
                                    <TeamMatchesTableTeamCell
                                        marksAsBold={teamId === item.guestTeamId}
                                        serial={[]}
                                        currentPosition={item.extraInfo.positions.guestCurrent}
                                        thenPosition={item.extraInfo.positions.guestThen}
                                        name={item.guestTeamName}
                                    />
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>
            </div>
            );
    }
}