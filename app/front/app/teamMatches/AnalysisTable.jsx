import React from 'react';
import {render} from 'react-dom';
import { Table } from 'semantic-ui-react'
import TeamMatchesTableTeamCell from './TeamMatchesTableTeamCell.jsx';
import TeamMatchesTableScoreCell from './TeamMatchesTableScoreCell.jsx';
import MatchForecastsOverall from '../MatchForecastsOverall.jsx';
import AnalysisTableFilterBlock from '../filterBlocks/AnalysisTableFilterBlock.jsx';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            positiveFilteredItemsIds: [],
            negativeFilteredItemsIds: [],
            neutralFilteredItemsIds: [],
        };
    }

    componentWillReceiveProps(nextProps){
        this.setState({
            positiveFilteredItemsIds: [],
            negativeFilteredItemsIds: [],
            neutralFilteredItemsIds: [],
        });
    }

    handleFilterClick(positiveFilteredItemsIds, negativeFilteredItemsIds, neutralFilteredItemsIds) {
        this.setState({
            positiveFilteredItemsIds,
            negativeFilteredItemsIds,
            neutralFilteredItemsIds,
        });
    }

    render() {
        let filteredItemsCount = this.state.positiveFilteredItemsIds.length
            + this.state.negativeFilteredItemsIds.length
            + this.state.neutralFilteredItemsIds.length;

        return (
            <div>

                <p>Total matches: {this.props.items.length}</p>
                <p>Filtered matches: {filteredItemsCount} ({this.constructor.calculatePercents(this.props.items.length, filteredItemsCount)})</p>
                <p>Positive matches: {this.state.positiveFilteredItemsIds.length} ({this.constructor.calculatePercents(filteredItemsCount, this.state.positiveFilteredItemsIds.length)})</p>
                <p>Negative matches: {this.state.negativeFilteredItemsIds.length} ({this.constructor.calculatePercents(filteredItemsCount, this.state.negativeFilteredItemsIds.length)})</p>
                <p>Neutral matches: {this.state.neutralFilteredItemsIds.length} ({this.constructor.calculatePercents(filteredItemsCount, this.state.neutralFilteredItemsIds.length)})</p>
                <p style={{marginBottom: '10px'}}>&nbsp;</p>

                <AnalysisTableFilterBlock
                    items={this.props.items}
                    payload={null}
                    handleFilterClick={this.handleFilterClick.bind(this)}
                />

                <Table fixed>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Date</Table.HeaderCell>
                            <Table.HeaderCell>Home Team</Table.HeaderCell>
                            <Table.HeaderCell>Score</Table.HeaderCell>
                            <Table.HeaderCell>Guest Team</Table.HeaderCell>
                            <Table.HeaderCell width="five">Forecasts</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.props.items.map((item) => {
                            return (
                                <Table.Row key={item._id} className={
                                    this.state.positiveFilteredItemsIds.find((id) => id === item._id)
                                        ? 'row-success'
                                        : (this.state.negativeFilteredItemsIds.find((id) => id === item._id)
                                            ? 'row-danger'
                                            : (this.state.neutralFilteredItemsIds.find((id) => id === item._id)
                                                ? 'row-neutral'
                                                : ''
                                            )
                                        )
                                }>
                                    <Table.Cell>{item.date.slice(0, 10)}</Table.Cell>
                                    <TeamMatchesTableTeamCell
                                        marksAsBold={this.state.teamId === item.homeTeamId}
                                        serial={item.extraInfo.serial.home}
                                        currentPosition={item.extraInfo.positions.homeCurrent}
                                        thenPosition={item.extraInfo.positions.homeThen}
                                        name={item.homeTeamName}
                                        last5MatchesTotals={[
                                            item.extraInfo.last5MatchesTotals.home.every,
                                            item.extraInfo.last5MatchesTotals.home.everyAvg,
                                            item.extraInfo.last5MatchesTotals.home.home,
                                            item.extraInfo.last5MatchesTotals.home.homeAvg,
                                        ]}
                                    />
                                    <TeamMatchesTableScoreCell
                                        homeScore={item.homeScore}
                                        guestScore={item.guestScore}
                                        total={item.totalScore}
                                        last5MatchesTotals={item.extraInfo.last5MatchesTotals}
                                    />
                                    <TeamMatchesTableTeamCell
                                        marksAsBold={this.state.teamId === item.guestTeamId}
                                        serial={item.extraInfo.serial.guest}
                                        currentPosition={item.extraInfo.positions.guestCurrent}
                                        thenPosition={item.extraInfo.positions.guestThen}
                                        name={item.guestTeamName}
                                        last5MatchesTotals={[
                                            item.extraInfo.last5MatchesTotals.guest.every,
                                            item.extraInfo.last5MatchesTotals.guest.everyAvg,
                                            item.extraInfo.last5MatchesTotals.guest.guest,
                                            item.extraInfo.last5MatchesTotals.guest.guestAvg,
                                        ]}
                                    />
                                    <Table.Cell width="five">
                                        <MatchForecastsOverall forecasts={item.extraInfo.scores}/>
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>

            </div>
        );
    }

    static calculatePercents(amount, count) {
        return amount
            ? (parseInt(count * 100 / amount) + '%')
            : '0%';
    }
}