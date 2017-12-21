import React from 'react';
import {render} from 'react-dom';
import { Table } from 'semantic-ui-react'
import TeamMatchesTableTeamCell from './TeamMatchesTableTeamCell.jsx';
import TeamMatchesTableScoreCell from './TeamMatchesTableScoreCell.jsx';
import { Checkbox } from 'semantic-ui-react'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowWins: true,
            isShowDraws: true,
            isShowLoses: true,
            isShowAtHome: true,
            isShowAtGuest: true,
            isShowOpponentPositionLess: true,
            isShowOpponentPositionGreater: true,
        };
    }

    handleCheckboxClick(checkboxName) {
        this.setState(
            (prevState) => ({[checkboxName]: !prevState[checkboxName]})
        );
    }

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
                <p className={"team-matches-table-team-name"}>{this.props.teamName}</p>

                <div className={"team-matches-table-div"}>
                    <div>
                        <p>At home: {winsAtHomeCount} (W) / {drawsAtHomeCount} (D) / {losesAtHomeCount} (L)</p>
                        <p>At guest: {winsAtGuestCount} (W) / {drawsAtGuestCount} (D) / {losesAtGuestCount} (L)</p>
                    </div>
                    <div>
                        <div><Checkbox label={<label>Wins</label>} checked={this.state.isShowWins} onClick={() => this.handleCheckboxClick('isShowWins')}/></div>
                        <div><Checkbox label={<label>Draws</label>} checked={this.state.isShowDraws} onClick={() => this.handleCheckboxClick('isShowDraws')} /></div>
                        <div><Checkbox label={<label>Loses</label>} checked={this.state.isShowLoses} onClick={() => this.handleCheckboxClick('isShowLoses')} /></div>
                    </div>
                    <div>
                        <div><Checkbox label={<label>At home</label>} checked={this.state.isShowAtHome} onClick={() => this.handleCheckboxClick('isShowAtHome')}/></div>
                        <div><Checkbox label={<label>At guest</label>} checked={this.state.isShowAtGuest} onClick={() => this.handleCheckboxClick('isShowAtGuest')} /></div>
                    </div>
                    {this.props.opponentPosition && (
                        <div>
                            <div><Checkbox label={<label>Opponent position > {this.props.opponentPosition}</label>} checked={this.state.isShowOpponentPositionGreater} onClick={() => this.handleCheckboxClick('isShowOpponentPositionGreater')}/></div>
                            <div><Checkbox label={<label>Opponent position &lt; {this.props.opponentPosition}</label>} checked={this.state.isShowOpponentPositionLess} onClick={() => this.handleCheckboxClick('isShowOpponentPositionLess')}/></div>
                        </div>
                    )}
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
                            let opponentPosition;
                            let res = 0;
                            if (teamId === item.homeTeamId) {
                                res = item.homeScore - item.guestScore;
                                opponentPosition = item.extraInfo.positions.guestCurrent;
                            } else {
                                res = item.guestScore - item.homeScore;
                                opponentPosition = item.extraInfo.positions.homeCurrent;
                            }

                            if (
                                (!res && !this.state.isShowDraws) ||
                                (res > 0 && !this.state.isShowWins) ||
                                (res < 0 && !this.state.isShowLoses) ||
                                (teamId === item.homeTeamId && !this.state.isShowAtHome) ||
                                (teamId === item.guestTeamId && !this.state.isShowAtGuest) ||
                                (
                                    this.props.opponentPosition &&
                                    (
                                        (!this.state.isShowOpponentPositionLess && opponentPosition < this.props.opponentPosition)
                                        || (!this.state.isShowOpponentPositionGreater && opponentPosition > this.props.opponentPosition)
                                    )
                                )
                            ) {
                                return null;
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