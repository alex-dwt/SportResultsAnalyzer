import React from 'react';
import {
    Button,
    Accordion,
    Dropdown,
    Table,
    Checkbox,
} from 'semantic-ui-react'
import AnalysisTable  from './teamMatches/AnalysisTable.jsx'

const BET_VALUE = 10;

const BET_TYPE_P1P2 = 1;
const BET_TYPE_X1X2 = 2;
const BET_TYPE_F0 = 3;

const BET_TYPE_LABELS = {
    [BET_TYPE_P1P2]: 'P1P2',
    [BET_TYPE_X1X2]: 'X1X2',
    [BET_TYPE_F0]: 'F0',
};

const RESULT_TYPE_POSITIVE = 1;
const RESULT_TYPE_NEGATIVE = 2;
const RESULT_TYPE_NEUTRAL = 3;
const RESULT_TYPE_NOT_SUITABLE = 4;
const RESULT_TYPE_NOT_CORRELATED = 5;
const RESULT_TYPES = [
    RESULT_TYPE_POSITIVE,
    RESULT_TYPE_NEGATIVE,
    RESULT_TYPE_NEUTRAL,
    RESULT_TYPE_NOT_SUITABLE,
    RESULT_TYPE_NOT_CORRELATED,
];

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state =  {
            summary: '',
            result: getEmptyResults(),
            isBetX1x2Enabled: true,
            isBetP1p2Enabled: true,
            isBetF0Enabled: true,
        };
    }

    handleCheckboxClick(checkboxName) {
        this.setState(
            (prevState) => ({[checkboxName]: !prevState[checkboxName]})
        );
    }

    onApply() {
        let result = getEmptyResults();

        if (!this.state.isBetX1x2Enabled &&
            !this.state.isBetP1p2Enabled &&
            !this.state.isBetF0Enabled
        ) {
            this.setState({result});

            return;
        }

        const minBetRates = [
            BET_TYPE_P1P2,
            BET_TYPE_F0,
            BET_TYPE_X1X2
        ].reduce(
            (initial, type) => ({...initial, [type]: getMinBetRate.call(this, type)}),
            {}
        );

        let totalToBet = 0;
        let totalToGet = 0;

        for (let match of this.props.items) {
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

            let x1x2Rate;
            if (teamToWin === 'home' && parseFloat(match.bookmakersStats.rates['1x'])) {
                x1x2Rate = parseFloat(match.bookmakersStats.rates['1x']);
            } else if (teamToWin === 'guest' && parseFloat(match.bookmakersStats.rates['x2'])) {
                x1x2Rate = parseFloat(match.bookmakersStats.rates['x2']);
            }

            let p1p2Rate;
            if (teamToWin === 'home' && parseFloat(match.bookmakersStats.rates['1'])) {
                p1p2Rate = parseFloat(match.bookmakersStats.rates['1']);
            } else if (teamToWin === 'guest' && parseFloat(match.bookmakersStats.rates['2'])) {
                p1p2Rate = parseFloat(match.bookmakersStats.rates['2']);
            }

            let f0Rate;
            {
                let f;
                if (teamToWin === 'home') {
                    f = match.bookmakersStats.rates.f1;
                } else if (teamToWin === 'guest') {
                    f = match.bookmakersStats.rates.f2;
                }
                if (f && f.count === 0 && parseFloat(f.value)) {
                    f0Rate = parseFloat(f.value);
                }
            }

            match = {
                ...match,
                bookmakersStatsRate: `
                    ${BET_TYPE_LABELS[BET_TYPE_P1P2]}: ${p1p2Rate || '-'};
                    ${BET_TYPE_LABELS[BET_TYPE_X1X2]}: ${x1x2Rate || '-'};
                    ${BET_TYPE_LABELS[BET_TYPE_F0]}: ${f0Rate || '-'};
                `
            };

            let betType, rate;
            if (this.state.isBetF0Enabled && f0Rate && f0Rate >= minBetRates[BET_TYPE_F0]) {
                betType = BET_TYPE_F0;
                rate = f0Rate;
            } else if (this.state.isBetP1p2Enabled && p1p2Rate && p1p2Rate >= minBetRates[BET_TYPE_P1P2]) {
                betType = BET_TYPE_P1P2;
                rate = p1p2Rate;
            } else if (this.state.isBetX1x2Enabled && x1x2Rate && x1x2Rate >= minBetRates[BET_TYPE_X1X2]) {
                betType = BET_TYPE_X1X2;
                rate = x1x2Rate;
            }

            if (!rate || !betType) {
                result[RESULT_TYPE_NOT_SUITABLE].items.push(match);
                continue;
            }

            match.bookmakersStatsRate += ` (${rate})`;

            // place bet
            totalToBet += BET_VALUE;

            let goals;
            if (teamToWin === 'home') {
                goals = match.homeScore - match.guestScore;
            } else {
                goals = match.guestScore - match.homeScore;
            }

            // get result
            let matchType;
            switch (betType) {
                case BET_TYPE_F0:
                    if (goals < 0) {
                        matchType = RESULT_TYPE_NEGATIVE;
                    } else if (goals > 0) {
                        totalToGet += BET_VALUE * rate;
                        matchType = RESULT_TYPE_POSITIVE;
                    } else {
                        totalToGet += BET_VALUE;
                        matchType = RESULT_TYPE_NEUTRAL;
                    }
                    break;
                case BET_TYPE_X1X2:
                    if (goals >= 0) {
                        totalToGet += BET_VALUE * rate;
                        matchType = RESULT_TYPE_POSITIVE;
                    } else {
                        matchType = RESULT_TYPE_NEGATIVE;
                    }
                    break;
                case BET_TYPE_P1P2:
                    if (goals > 0) {
                        totalToGet += BET_VALUE * rate;
                        matchType = RESULT_TYPE_POSITIVE;
                    } else {
                        matchType = RESULT_TYPE_NEGATIVE;
                    }
                    break;
                default:
                    throw new Error('Wrong betType');
            }

            if (!matchType) {
                throw new Error('Wrong matchType');
            }

            result[matchType].items.push(match);
        }

        /**
         * Write summary
         */

        if (result[RESULT_TYPE_NOT_CORRELATED].items.length) {
            result[RESULT_TYPE_NOT_CORRELATED].label = `Matches without bookmaker's stats: ${result[RESULT_TYPE_NOT_CORRELATED].items.length}`;
        }
        if (result[RESULT_TYPE_NOT_SUITABLE].items.length) {
            result[RESULT_TYPE_NOT_SUITABLE].label = `Matches with a bad rate or without a winner: ${result[RESULT_TYPE_NOT_SUITABLE].items.length}`;
        }
        let negativeCount = result[RESULT_TYPE_NEGATIVE].items.length;
        let positiveCount = result[RESULT_TYPE_POSITIVE].items.length;
        let neutralCount = result[RESULT_TYPE_NEUTRAL].items.length;
        let totalCount = negativeCount + positiveCount + neutralCount;

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
        if (neutralCount) {
            result[RESULT_TYPE_NEUTRAL].label = `Neutral: ${neutralCount}
            (${AnalysisTable.calculatePercents(
                totalCount,
                neutralCount
            )})`;
        }

        this.setState({
            result,
            summary: `Earned money total: ${Math.round((totalToGet - totalToBet) * 100) / 100}`
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
            <div className="rates-analyser">
                <h6>Rates analyser</h6>

                <div>

                    <div className="bet-type">
                        <Checkbox
                            label={<label>{BET_TYPE_LABELS[BET_TYPE_F0]}</label>}
                            checked={this.state.isBetF0Enabled}
                            onClick={() => this.handleCheckboxClick('isBetF0Enabled')}
                        />
                        <div>
                            <Dropdown
                                selection
                                options={getMinRatesValues()}
                                ref={input => this.f0MinRateInput = input}
                                defaultValue={1.4}
                            />
                        </div>
                    </div>

                    <div className="bet-type">
                        <Checkbox
                            label={<label>{BET_TYPE_LABELS[BET_TYPE_P1P2]}</label>}
                            checked={this.state.isBetP1p2Enabled}
                            onClick={() => this.handleCheckboxClick('isBetP1p2Enabled')}
                        />
                        <div>
                            <Dropdown
                                selection
                                options={getMinRatesValues()}
                                ref={input => this.p1p2MinRateInput = input}
                                defaultValue={1.4}
                            />
                        </div>
                    </div>

                    <div className="bet-type">
                        <Checkbox
                            label={<label>{BET_TYPE_LABELS[BET_TYPE_X1X2]}</label>}
                            checked={this.state.isBetX1x2Enabled}
                            onClick={() => this.handleCheckboxClick('isBetX1x2Enabled')}
                        />
                        <div>
                            <Dropdown
                                selection
                                options={getMinRatesValues()}
                                ref={input => this.x1x2MinRateInput = input}
                                defaultValue={1.4}
                            />
                        </div>
                    </div>

                    <div className="button-div">
                        <Button
                            style={{marginTop: '10px'}}
                            onClick={() => this.onApply()}
                        >
                            Show
                        </Button>
                    </div>

                    <p className="summary-line">
                        {this.state.summary}
                    </p>

                </div>

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

function getMinRatesValues() {
    let vals = [];
    let val = 1;

    while(val <= 3) {
        vals.push(Math.round(val * 100) / 100);
        val += 0.05;
    }

    return vals.map((v) => ({
        text: v,
        value: v,
        key: v,
    }));
}

function getMinBetRate(betType) {
    let val = 1;

    switch (betType) {
        case BET_TYPE_P1P2:
            val = this.p1p2MinRateInput.state.value;
            break;
        case BET_TYPE_X1X2:
            val = this.x1x2MinRateInput.state.value;
            break;
        case BET_TYPE_F0:
            val = this.f0MinRateInput.state.value;
            break;
    }

    return val;
}