import React from 'react';
import {render} from 'react-dom';
import TournamentSelector from './TournamentSelector.jsx';
import Request  from './Request.jsx'
import SiteUrlsBlock  from './SiteUrlsBlock.jsx'
import { Tab } from 'semantic-ui-react'
import ScoreTable from './ScoreTable.jsx';
import MatchesTable from './teamMatches/MatchesTable.jsx';
import AnalysisTable from './teamMatches/AnalysisTable.jsx';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tournamentsList: [],
            tournamentId: '',
            tournamentScoreTable: [],
            tournamentAllMatches: [],
            tournamentTeams: [],
        };
    }

    loadTournamentsList() {
        return Request.getTournamentsList(sessionStorage.getItem('sport'));
    }

    componentDidMount() {
        this.loadTournamentsList()
            .then((data) => this.setState({
                tournamentsList: data.map((o) => ({value: o.tournamentId, text: o.tournamentName}))
            }))
    }

    onTournamentSelector(tournamentId) {
        if (this.state.tournamentId === tournamentId || !tournamentId) {
            return;
        }

        this.setState({tournamentId});

        Request
            .getTournamentScoreTable(sessionStorage.getItem('sport'), tournamentId)
            .then((tournamentScoreTable) => this.setState({tournamentScoreTable}));
        Request
            .getAllMatches(sessionStorage.getItem('sport'), tournamentId)
            .then((tournamentAllMatches) => this.setState({tournamentAllMatches}));
        Request
            .getTournamentTeams(sessionStorage.getItem('sport'), tournamentId)
            .then((tournamentTeams) => this.setState({tournamentTeams}));
    }

    render() {
        return (
            <div>

                <TournamentSelector items={this.state.tournamentsList} handleClick={this.onTournamentSelector.bind(this)}/>

                <SiteUrlsBlock tournamentId={this.state.tournamentId}/>

                <div style={{marginTop: '5px'}}>
                    <Tab panes={[
                        { menuItem: 'Score Table', pane: {
                            key: 'tab1',
                            content: (
                                <ScoreTable items={this.state.tournamentScoreTable}/>
                            )
                        }},
                        { menuItem: 'Matches', pane: {
                            key: 'tab2',
                            content: (
                                <MatchesTable
                                    items={this.state.tournamentAllMatches}
                                    teams={this.state.tournamentTeams}
                                />
                            )
                        }},
                        { menuItem: 'Analysis', pane: {
                            key: 'tab3',
                            content: (
                                <AnalysisTable items={this.state.tournamentAllMatches}/>
                            )
                        }},
                    ]} renderActiveOnly={false}/>
                </div>

            </div>
        );
    }
}