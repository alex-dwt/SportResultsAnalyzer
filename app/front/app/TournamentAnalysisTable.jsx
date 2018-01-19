import React from 'react';
import { Table } from 'semantic-ui-react'
import { Dropdown } from 'semantic-ui-react'
import AnalysisTable  from './teamMatches/AnalysisTable.jsx'

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

        /**
         * Calculate summary for every filter
         */
        let summaryItems = [];

        for (const filter of filterOptions) {
            if (filter.value === '') {
                continue;
            }

            let result;

            for (const item of this.props.items) {
                if (filter.value !== item.filter.id) {
                    continue;
                }
                if (!result) {
                    result = {
                        id: filter.value,
                        filterName: filter.text
                    };
                }
                for (const fieldName of [
                    'itemsCount',
                    'filteredItemsCount',
                    'neutralFilteredItemsCount',
                    'positiveFilteredItemsCount',
                    'negativeFilteredItemsCount',
                ]) {
                    if (typeof result[fieldName] === 'undefined') {
                        result[fieldName] = 0;
                    }
                    result[fieldName] += item[fieldName];
                }
            }

            if (result) {
                summaryItems.push(result);
            }
        }

        /**
         * Show items
         */
        let items = this.props.items.filter((o) => this.state.filterId === '' || o.filter.id === this.state.filterId);

        if (this.state.orderId) {
            items.sort((a, b) => parseInt(a[this.state.orderId]) - parseInt(b[this.state.orderId]));
            if (this.state.orderDirectionId !== 'asc') {
                items.reverse();
            }
        }

        return (
            <div className="tournament-analysis-table-block">

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

                    <Table.Footer>
                        {summaryItems.map((item) => {
                            return (
                                <Table.Row key={item.id}>
                                    <Table.Cell></Table.Cell>
                                    <Table.Cell>{item.itemsCount}</Table.Cell>
                                    <Table.Cell>
                                        {item.filteredItemsCount} ({AnalysisTable.calculatePercents(
                                            item.itemsCount,
                                            item.filteredItemsCount
                                        )})
                                    </Table.Cell>
                                    <Table.Cell positive>
                                        {item.positiveFilteredItemsCount} ({AnalysisTable.calculatePercents(
                                            item.filteredItemsCount,
                                            item.positiveFilteredItemsCount
                                        )})
                                    </Table.Cell>
                                    <Table.Cell negative>
                                        {item.negativeFilteredItemsCount} ({AnalysisTable.calculatePercents(
                                            item.filteredItemsCount,
                                            item.negativeFilteredItemsCount
                                        )})
                                    </Table.Cell>
                                    <Table.Cell warning>
                                        {item.neutralFilteredItemsCount} ({AnalysisTable.calculatePercents(
                                            item.filteredItemsCount,
                                            item.neutralFilteredItemsCount
                                        )})
                                    </Table.Cell>
                                    <Table.Cell>{item.filterName}</Table.Cell>
                                    <Table.Cell></Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Footer>

                </Table>

            </div>
        );
    }
}