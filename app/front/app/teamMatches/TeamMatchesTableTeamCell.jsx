import React from 'react';
import {render} from 'react-dom';
import { Table } from 'semantic-ui-react'

export default class extends React.Component {
    render() {
        return (
            <Table.Cell>
                <span className={this.props.marksAsBold ? 'bold' : ''}>
                    ({this.props.currentPosition} / <span className={'then-position'}>{this.props.thenPosition}</span>)&nbsp;
                    {this.props.name}
                </span>
                {this.props.serial && <p>{this.props.serial.join(' ').toUpperCase()}</p>}
                {this.props.last5MatchesTotals &&
                    <div>
                        <p>Every: {this.props.last5MatchesTotals[0].join(', ').toUpperCase()} ({this.props.last5MatchesTotals[1]})</p>
                        <p>At home/guest: {this.props.last5MatchesTotals[2].join(', ').toUpperCase()} ({this.props.last5MatchesTotals[3]})</p>
                    </div>
                }
            </Table.Cell>
        );
    }
}