import React from 'react';
import {
    Button,
    Accordion,
    Dropdown,
    Table
} from 'semantic-ui-react'
import AnalysisTable  from './teamMatches/AnalysisTable.jsx'

const BET_VALUE = 10;
const BET_MIN_RATE = 1.1;

const BET_TYPE_P1P2 = 1;
const BET_TYPE_X1X2 = 2;
// const BET_TYPE_F0 = 3;
// const BET_TYPE_F0P1P2 = 4;
// const BET_TYPE_F0P1P2X1X2 = 5;
// const BET_TYPE_P1P2X1X2 = 6;

const RESULT_TYPE_POSITIVE = 1;
const RESULT_TYPE_NEGATIVE = 2;
const RESULT_TYPE_NOT_SUITABLE = 3;
const RESULT_TYPE_NOT_CORRELATED = 4;
const RESULT_TYPES = [
    RESULT_TYPE_POSITIVE,
    RESULT_TYPE_NEGATIVE,
    RESULT_TYPE_NOT_SUITABLE,
    RESULT_TYPE_NOT_CORRELATED,
];

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state =  {
            betType: '',
            summary: '',
            result: getEmptyResults(),
        };
    }

    onApply() {
        let result = getEmptyResults();

        if (!this.state.betType) {
            this.setState({result});

            return;
        }

        let totalToBet = 0;
        let totalToGet = 0;

        for (const match of this.props.items) {
            let stats = match.bookmakersStats;
            if (typeof stats === 'string') {
                result[RESULT_TYPE_NOT_CORRELATED].items.push(match);
                continue;
            }

            let teamToWin = match.scores
                .find(o => o.forecastNum === 5)
                .value.find(o => o.info.type === 'forecast1').info.strongerTeam;
            if (!teamToWin) {
                result[RESULT_TYPE_NOT_SUITABLE].items.push(match);
                continue;
            }

            let rate;
            switch (this.state.betType) {
                case BET_TYPE_P1P2:
                    if (teamToWin === 'home' && parseFloat(match.bookmakersStats.rates['1'])) {
                        rate = parseFloat(match.bookmakersStats.rates['1']);
                    } else if (teamToWin === 'guest' && parseFloat(match.bookmakersStats.rates['2'])) {
                        rate = parseFloat(match.bookmakersStats.rates['2']);
                    }
                    break;
                case BET_TYPE_X1X2:
                    if (teamToWin === 'home' && parseFloat(match.bookmakersStats.rates['1x'])) {
                        rate = parseFloat(match.bookmakersStats.rates['1x']);
                    } else if (teamToWin === 'guest' && parseFloat(match.bookmakersStats.rates['x2'])) {
                        rate = parseFloat(match.bookmakersStats.rates['x2']);
                    }
                    break;
            }

            if (!rate || rate < BET_MIN_RATE) {
                result[RESULT_TYPE_NOT_SUITABLE].items.push({
                    ...match,
                    bookmakersStatsRate: rate
                });
                continue;
            }

            // place bet
            totalToBet += BET_VALUE;

            let goals;
            if (teamToWin === 'home') {
                goals = match.homeScore - match.guestScore;
            } else {
                goals = match.guestScore - match.homeScore;
            }

            // get result

            if (
                goals < 0 ||
                (this.state.betType === BET_TYPE_P1P2 && goals < 1)
            ) {
                result[RESULT_TYPE_NEGATIVE].items.push(match);
                continue;
            }

            // bet passed
            totalToGet += BET_VALUE * rate; // todo if F0 ?
            result[RESULT_TYPE_POSITIVE].items.push({
                ...match,
                bookmakersStatsRate: rate
            });
        }


        if (result[RESULT_TYPE_NOT_CORRELATED].items.length) {
            result[RESULT_TYPE_NOT_CORRELATED].label = `Matches without bookmaker's stats: ${result[RESULT_TYPE_NOT_CORRELATED].items.length}`;
        }
        if (result[RESULT_TYPE_NOT_SUITABLE].items.length) {
            result[RESULT_TYPE_NOT_SUITABLE].label = `Matches with a bad rate or without a winner: ${result[RESULT_TYPE_NOT_SUITABLE].items.length}`;
        }
        let negativeCount = result[RESULT_TYPE_NEGATIVE].items.length;
        let positiveCount = result[RESULT_TYPE_POSITIVE].items.length;
        let totalCount = negativeCount + positiveCount;

        if (negativeCount) {
            result[RESULT_TYPE_NEGATIVE].label = `
            Negative: ${negativeCount}
            (${AnalysisTable.calculatePercents(
                totalCount,
                negativeCount
            )})`;
        }
        if (positiveCount) {
            result[RESULT_TYPE_POSITIVE].label = `Positive: ${positiveCount}
            (${AnalysisTable.calculatePercents(
                totalCount,
                positiveCount
            )})`;
        }

        this.setState({
            result,
            summary: `Earned money total: ${totalToGet - totalToBet}`
        });
    }

    render() {
        let panels = [];

        for (const type of RESULT_TYPES) {
            let result = this.state.result[type] || null;
            if (!result || !result.label) {
                continue;
            }

            panels.push({
                title: result.label,
                content: {
                    content: result.items.length
                        ? <Table fixed>
                            <Table.Body>
                                {result.items.map((item) => {
                                    let cells = [
                                        item.tournamentName,
                                        item.homeTeamName,
                                        item.guestTeamName,
                                        `${item.homeScore} - ${item.guestScore}`,
                                        item.bookmakersStatsRate || '-'
                                    ];

                                    return (
                                        <Table.Row key={item._id}>
                                            {cells.map((item, index) =>
                                                <Table.Cell key={index}>{item}</Table.Cell>
                                            )}
                                        </Table.Row>
                                    )
                                })}
                            </Table.Body>
                        </Table>
                        : '',
                    key: `_${type}`
                } },
            );
        }

        return (
            <div>
                <p>Bet Type</p>
                <Dropdown
                    selection
                    options={
                        [
                            {
                                value: '',
                                text: ''
                            },
                            {
                                text: 'P1 P2',
                                value: BET_TYPE_P1P2
                            },
                            {
                                text: 'X1 X2',
                                value: BET_TYPE_X1X2
                            },
                        ]
                        .map((o) => ({...o, key: o.value || '-'}))}
                    defaultValue="-"
                    onChange={(e, { value }) => this.setState({betType: value})}
                />

                <Button
                    style={{marginTop: '10px'}}
                    onClick={() => this.onApply()}
                >
                    Show
                </Button>

                <p><b>{this.state.summary}</b></p>

                <Accordion panels={panels} exclusive={false} fluid />

            </div>
        );
    }
}

function getEmptyResults() {
    let res = {};

    for (const type of RESULT_TYPES) {
        res[type] = {
            items: [],
            label: '',
        };
    }

    return res;
}