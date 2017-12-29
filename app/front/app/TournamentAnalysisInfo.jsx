import React from 'react';
import Request  from './Request.jsx'
import TournamentAnalysisTable  from './TournamentAnalysisTable.jsx'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
        };
    }

    componentDidMount() {
        Request
            .getTournamentAnalysisItems()
            .then((items) => this.setState({items}));
    }

    render() {
        return (
            <div>

                <h3>Tournaments Analysis Statistics</h3>

                <h4>Actual</h4>
                <TournamentAnalysisTable items={this.state.items.filter((o) => !o.isArchived)}/>

                <h4>Archived</h4>
                <TournamentAnalysisTable items={this.state.items.filter((o) => o.isArchived)}/>

            </div>
        );
    }
}