import React from 'react';
import {render} from 'react-dom';
import { Table } from 'semantic-ui-react'

export default class extends React.Component {
    render() {
        let activeRows = this.props.activeRows;

        return (
            <Table fixed>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell></Table.HeaderCell>
                        <Table.HeaderCell>MP</Table.HeaderCell>
                        <Table.HeaderCell>W</Table.HeaderCell>
                        <Table.HeaderCell>D</Table.HeaderCell>
                        <Table.HeaderCell>L</Table.HeaderCell>
                        <Table.HeaderCell>GF</Table.HeaderCell>
                        <Table.HeaderCell>GA</Table.HeaderCell>
                        <Table.HeaderCell>AGF</Table.HeaderCell>
                        <Table.HeaderCell>AGA</Table.HeaderCell>
                        <Table.HeaderCell>GD</Table.HeaderCell>
                        <Table.HeaderCell>P</Table.HeaderCell>
                        <Table.HeaderCell>Last 5</Table.HeaderCell>
                        <Table.HeaderCell>AGFH</Table.HeaderCell>
                        <Table.HeaderCell>AGAH</Table.HeaderCell>
                        <Table.HeaderCell>AGFG</Table.HeaderCell>
                        <Table.HeaderCell>AGAG</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {this.props.items.map((item) =>
                        <Table.Row key={item.teamId}>
                            <Table.Cell>{item.position}. {item.teamName}</Table.Cell>
                            <Table.Cell>{item.statistics.mp}</Table.Cell>
                            <Table.Cell>{item.statistics.w}</Table.Cell>
                            <Table.Cell>{item.statistics.d}</Table.Cell>
                            <Table.Cell>{item.statistics.l}</Table.Cell>
                            <Table.Cell>{item.statistics.gf}</Table.Cell>
                            <Table.Cell>{item.statistics.ga}</Table.Cell>
                            <Table.Cell>{item.statistics.agf}</Table.Cell>
                            <Table.Cell>{item.statistics.aga}</Table.Cell>
                            <Table.Cell>{item.statistics.gd}</Table.Cell>
                            <Table.Cell>{item.statistics.p}</Table.Cell>
                            <Table.Cell>{item.statistics.last5.join(' ').toUpperCase()}</Table.Cell>
                            <Table.Cell active={activeRows[item.teamId] && activeRows[item.teamId] === 'home'}>
                                {item.statistics.agfh}
                            </Table.Cell>
                            <Table.Cell active={activeRows[item.teamId] && activeRows[item.teamId] === 'home'}>
                                {item.statistics.agah}
                            </Table.Cell>
                            <Table.Cell active={activeRows[item.teamId] && activeRows[item.teamId] === 'guest'}>
                                {item.statistics.agfg}
                            </Table.Cell>
                            <Table.Cell active={activeRows[item.teamId] && activeRows[item.teamId] === 'guest'}>
                                {item.statistics.agag}
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        );
    }
}