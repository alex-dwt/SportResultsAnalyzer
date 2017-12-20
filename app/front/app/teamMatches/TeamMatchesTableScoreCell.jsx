import React from 'react';
import {render} from 'react-dom';
import { Table } from 'semantic-ui-react'

export default class extends React.Component {
    render() {
        return (
            <Table.Cell>
                   {this.props.homeScore} - {this.props.guestScore}
            </Table.Cell>
        );
    }
}