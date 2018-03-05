import React from 'react';
import {render} from 'react-dom';
import { Table } from 'semantic-ui-react'

export default class extends React.Component {
    render() {
        let data = this.props.data;

        if (typeof data === 'string') {
            return (
                <Table fixed celled className={'bookmaker-stats-table'}>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>
                                <p style={{textAlign: 'center'}}>{data}</p>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            );
        } else {
            return (
                <Table fixed celled className={'bookmaker-stats-table'}>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell colSpan='8'>
                                <p style={{textAlign: 'center'}}>
                                    <a target="_blank" href={data.url}>{data.homeTeamName} - {data.guestTeamName}</a>
                                    <br/>
                                    {data.date.slice(0, 10)} {data.time}
                                </p>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>1</Table.Cell>
                            <Table.Cell>X</Table.Cell>
                            <Table.Cell>2</Table.Cell>
                            <Table.Cell>1X</Table.Cell>
                            <Table.Cell>12</Table.Cell>
                            <Table.Cell>2X</Table.Cell>
                            <Table.Cell>F1</Table.Cell>
                            <Table.Cell>F2</Table.Cell>
                            {typeof data.rates.lt !== 'undefined' ? <Table.Cell>&lt; {data.rates.lt.count}</Table.Cell> : ''}
                            {typeof data.rates.gt !== 'undefined' ? <Table.Cell>&gt; {data.rates.gt.count}</Table.Cell> : ''}
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>{data.rates[1]}</Table.Cell>
                            <Table.Cell>{data.rates.x}</Table.Cell>
                            <Table.Cell>{data.rates[2]}</Table.Cell>
                            <Table.Cell>{data.rates['1x']}</Table.Cell>
                            <Table.Cell>{data.rates[12]}</Table.Cell>
                            <Table.Cell>{data.rates.x2}</Table.Cell>
                            <Table.Cell>({data.rates.f1.count}) {data.rates.f1.value}</Table.Cell>
                            <Table.Cell>({data.rates.f2.count}) {data.rates.f2.value}</Table.Cell>
                            {typeof data.rates.lt !== 'undefined' ? <Table.Cell>{data.rates.lt.value}</Table.Cell> : ''}
                            {typeof data.rates.gt !== 'undefined' ? <Table.Cell>{data.rates.gt.value}</Table.Cell> : ''}
                        </Table.Row>
                    </Table.Body>
                </Table>
            );
        }
    }
}