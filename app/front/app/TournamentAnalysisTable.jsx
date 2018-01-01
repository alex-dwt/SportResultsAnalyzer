import React from 'react';
import { Table } from 'semantic-ui-react'

export default class extends React.Component {
    render() {
        return (
                <Table fixed>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Tournament</Table.HeaderCell>
                            <Table.HeaderCell>Total matches</Table.HeaderCell>
                            <Table.HeaderCell>Filtered matches</Table.HeaderCell>
                            <Table.HeaderCell>Positive matches</Table.HeaderCell>
                            <Table.HeaderCell>Negative matches</Table.HeaderCell>
                            <Table.HeaderCell>Neutral matches</Table.HeaderCell>
                            <Table.HeaderCell>Filter</Table.HeaderCell>
                            <Table.HeaderCell>Date</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.props.items.map((item) => {
                            return (
                                <Table.Row key={item._id}>
                                    <Table.Cell>{item.tournamentName}</Table.Cell>
                                    <Table.Cell>{item.itemsCount}</Table.Cell>
                                    <Table.Cell>{item.filteredItemsCount} ({item.filteredItemsPercent})</Table.Cell>
                                    <Table.Cell positive>{item.positiveFilteredItemsCount} ({item.positiveFilteredItemsPercent})</Table.Cell>
                                    <Table.Cell negative>{item.negativeFilteredItemsCount} ({item.negativeFilteredItemsPercent})</Table.Cell>
                                    <Table.Cell warning>{item.neutralFilteredItemsCount} ({item.neutralFilteredItemsPercent})</Table.Cell>
                                    <Table.Cell>
                                        <p dangerouslySetInnerHTML={{__html: item.filter.name.split(';').join('<br/>')}}></p>
                                    </Table.Cell>
                                    <Table.Cell>{item.date.slice(0, 10)}</Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
        );
    }
}