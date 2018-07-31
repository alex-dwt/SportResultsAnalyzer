import React from 'react';
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
import Request  from './Request.jsx'
import NextTabFilterBlock  from './filterBlocks/NextTabFilterBlock.jsx'
import PrevTabForecastsAnalyserBlock  from './PrevTabForecastsAnalyserBlock.jsx'

import 'react-datepicker/dist/react-datepicker.css';

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
            statistics: [],
        };
    }

    loadMatches(sport, date) {
        return Request.getNextMatches(sport, date);
    }

    handleClick() {
        this
            .loadMatches(
                sessionStorage.getItem('sport'),
                this.state.date,
            )
            .then((res) => {
                this.matchesData = res;
                this.setState({
                    filteredItems: this.matchesData.items,
                    itemsCount: this.matchesData.items.length,
                });
            });
    }

    handleFilterClick(filteredItems) {
        this.setState({filteredItems});
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
                    Request.getTeamMatches(item.sport, item.tournamentId, teamId).then((res) =>
                        this.setState((prevState) => ({
                            teamsMatches: prevState.teamsMatches.concat([{
                                teamId,
                                matches: res
                            }])
                        }))
                    );
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
                            <p>Total matches: {this.state.itemsCount}</p>
                            <p>Filtered matches: {this.state.filteredItems.length}</p>
                        </Grid.Column>

                        <NextTabFilterBlock
                            items={this.matchesData.items}
                            payload={this.matchesData.statistics}
                            handleFilterClick={this.handleFilterClick.bind(this)}
                        />

                    </Grid>
                </div>

                {this.state.filteredItems.map((item, index) => {
                        let teamsVar = item.homeTeamId + '-' + item.guestTeamId;

                        let statisticsHome = this
                            .matchesData
                            .statistics[item.tournamentId]
                            .tournamentResults
                            .filter((team) => team.teamId === item.homeTeamId);
                        if (statisticsHome.length) {
                            statisticsHome = statisticsHome[0].statistics;
                        } else {
                            statisticsHome = null;
                        }

                        let statisticsGuest = this
                            .matchesData
                            .statistics[item.tournamentId]
                            .tournamentResults
                            .filter((team) => team.teamId === item.guestTeamId);
                        if (statisticsGuest.length) {
                            statisticsGuest = statisticsGuest[0].statistics;
                        } else {
                            statisticsGuest = null;
                        }

                        return (
                            <div key={item._id} className={'next-match-div-one-match'}>
                                <p style={{marginTop: '10px', fontWeight: 'bold'}}>
                                    Match #{index +1} of {this.state.filteredItems.length}
                                </p>

                                <Grid columns={5} divided textAlign={'center'} verticalAlign={'middle'} className={'next-match-grid'}>
                                    <Grid.Row>
                                        <Grid.Column style={{'width': '10%'}}>
                                            {
                                                typeof  item.homeScore !== 'undefined' &&
                                                `${item.homeScore} - ${item.guestScore} (${item.totalScore})`
                                            }
                                        </Grid.Column>
                                        <Grid.Column style={{'width': '30%'}}>
                                            {item.tournamentName}<br/>
                                            {item.date.slice(0, 10)} {item.time}
                                        </Grid.Column>
                                        <Grid.Column style={{'width': '25%'}}>
                                            {item.homeTeamName}<br/>
                                            {statisticsHome ? statisticsHome.serial.join(' ').toUpperCase() : ''}
                                        </Grid.Column>
                                        <Grid.Column style={{'width': '25%'}}>
                                            {item.guestTeamName}<br/>
                                            {statisticsGuest ? statisticsGuest.serial.join(' ').toUpperCase() : ''}
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
                                                    {/*<TeamMatchesTable*/}
                                                        {/*items={this.state.teamsMatches.reduce((result, o) => o.teamId === item.homeTeamId ? o.matches : result, [])}*/}
                                                        {/*teamId={item.homeTeamId}*/}
                                                        {/*teamName={item.homeTeamName}*/}
                                                        {/*opponentPosition={this.matchesData.statistics[item.tournamentId].tournamentResults.find((team) => team.teamId === item.guestTeamId).position}*/}
                                                    {/*/>*/}
                                                </div>
                                                <div style={{'marginLeft': '30px'}}>
                                                    {/*<TeamMatchesTable*/}
                                                        {/*items={this.state.teamsMatches.reduce((result, o) => o.teamId === item.guestTeamId ? o.matches : result, [])}*/}
                                                        {/*teamId={item.guestTeamId}*/}
                                                        {/*teamName={item.guestTeamName}*/}
                                                        {/*opponentPosition={this.matchesData.statistics[item.tournamentId].tournamentResults.find((team) => team.teamId === item.homeTeamId).position}*/}
                                                    {/*/>*/}
                                                </div>
                                            </div>
                                        )
                                    }},
                                ]} renderActiveOnly={false} onTabChange={(e, data) => this.handleChangeTab(e, data, item)}/>

                            </div>
                        );
                    }
                )}

                <PrevTabForecastsAnalyserBlock items={this.state.filteredItems}/>

            </div>
        );
    }
}