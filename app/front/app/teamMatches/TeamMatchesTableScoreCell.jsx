import React from 'react';
import {render} from 'react-dom';
import { Table } from 'semantic-ui-react'

export default class extends React.Component {
    render() {
        return (
            <Table.Cell>
                    {this.props.homeScore} - {this.props.guestScore} ({this.props.total})
                    {this.props.last5MatchesTotals &&
                        <div>
                            <p>EveryAvg: {this.props.last5MatchesTotals.everyAvg}</p>
                            <p>AtAvg: {this.props.last5MatchesTotals.atAvg}</p>
                            <p>Avg: {this.props.last5MatchesTotals.avg}</p>
                        </div>
                   }
            </Table.Cell>
        );
    }
}