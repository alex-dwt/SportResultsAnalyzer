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
            </Table.Cell>
        );
    }
}