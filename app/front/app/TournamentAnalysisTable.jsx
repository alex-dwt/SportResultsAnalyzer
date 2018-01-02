import React from 'react';
import { Table } from 'semantic-ui-react'
import { Dropdown } from 'semantic-ui-react'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filterId: '',
            orderId: '',
            orderDirectionId: 'desc',
        };
    }

    render() {
        let filterOptions = [{ value: '', text: '' }];
        for (const item of this.props.items) {
            let filter = item.filter;
            if (!filterOptions.find((o) => filter.id === o.value)) {
                filterOptions.push({ value: filter.id, text: filter.name });
            }
        }

        let items = this.props.items.filter((o) => this.state.filterId === '' || o.filter.id === this.state.filterId);

        if (this.state.orderId) {
            items.sort((a, b) => parseInt(a[this.state.orderId]) - parseInt(b[this.state.orderId]));
            if (this.state.orderDirectionId !== 'asc') {
                items.reverse();
            }
        }

        return (
            <div>

                <div className="tournament-analysis-table-filter-div">
                    <p>Filter</p>
                    <Dropdown
                            selection
                            options={filterOptions.map((o) => ({...o, key: o.value === '' ? '-' : o.value}))}
                            defaultValue="-"
                            onChange={(e, { value }) => this.setState({filterId: value})}
                        />

                    <p>Order</p>
                    <Dropdown
                            selection
                            options={
                                [
                                    { value: '', text: '' },
                                    { value: 'filteredItemsPercent', text: 'Filtered' },
                                    { value: 'positiveFilteredItemsPercent', text: 'Positive' },
                                    { value: 'neutralFilteredItemsPercent', text: 'Neutral' },
                                    { value: 'negativeFilteredItemsPercent', text: 'Negative' },
                                ].map((o) => ({...o, key: o.value || '-'}))
                            }
                            defaultValue="-"
                            onChange={(e, { value }) => this.setState({orderId: value})}
                        />
                    <Dropdown
                            selection
                            options={[{ value: 'asc', text: 'ASC' }, { value: 'desc', text: 'DESC' }].map((o) => ({...o, key: o.value}))}
                            defaultValue="desc"
                            onChange={(e, { value }) => this.setState({orderDirectionId: value})}
                        />
                </div>


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
                        {items.map((item) => {
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

            </div>
        );
    }
}