/*
 * This file is part of the SportResultsAnalyzer package.
 * (c) Alexander Lukashevich <aleksandr.dwt@gmail.com>
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

const xl = require('excel4node');

const STYLE = {
    font: { color: '#000000', size: 12 },
    border: { right: { style: 'thin', color: '#000000',  }, },
    alignment: { horizontal: ['center'], vertical: ['center'], },
};
const STYLE_WITH_BB = {...STYLE, border: {
    right: { style: 'thin',   color: '#000000',  },
    bottom: {  style: 'thick', color: '#000000', },
},};
const STYLE_WITH_MBB = {...STYLE, border: {
    right: { style: 'thin',   color: '#000000',  },
    bottom: {  style: 'medium', color: '#000000', },
},};
const STYLE_WITH_TBB = {...STYLE, border: {
    right: { style: 'thin',   color: '#000000',  },
    bottom: {  style: 'thin', color: '#000000', },
},};

module.exports = {
    doExport: matches => new Promise(resolve  => {
        const wb = new xl.Workbook();
        const ws = wb.addWorksheet('Results');
        writeHeader(ws);
        writeBody(ws, matches);
        wb.writeToBuffer().then(buffer => resolve(buffer));
    }),
};

function writeHeader(ws) {
    let column = 1;
    for (const label of ['Date', 'Tournament', 'Tours', 'Team 1', 'Team 2', 'Pos/Serial']) {
        ws.cell(1, column, 2, column, true).string(label).style(STYLE_WITH_BB);
        column++;
    }

    ws.cell(1, column, 1, column + 3, true).string('Forecast 1').style(STYLE_WITH_TBB);
    for (let j = 2; j <= 5; j++) {
        ws.cell(2, column++).string(j.toString()).style(STYLE_WITH_BB);
    }

    for (const label of ['Forecast 2', 'Forecast 4']) {
        ws.cell(1, column, 2, column, true).string(label).style(STYLE_WITH_BB);
        column++;
    }

    ws.cell(1, column, 1, column + 8, true).string('Bet').style(STYLE_WITH_TBB);
    for (const type of ['x', 'RISKY', 'NOT RISKY']) {
        ws.cell(2, column++).string(type).style(STYLE_WITH_BB);
        ws.cell(2, column++).string('rate').style(STYLE_WITH_BB);
        ws.cell(2, column++).string('result').style(STYLE_WITH_BB);
    }

    ws.cell(1, column, 2, column, true).string('Result').style(STYLE_WITH_BB);
}

function writeBody(ws, matches) {
    let row = 3;
    for (const match of matches) {
        let column = 1;

        ws
            .cell(row, column, row + 1, column, true)
            .string(`${match.date.getDate()}/${match.date.getMonth() + 1}/${match.date.getFullYear()}`)
            .style(STYLE_WITH_MBB);
        column++;

        ws.cell(row, column, row + 1, column, true).string(match.tournamentName).style(STYLE_WITH_MBB);
        column++;

        ws
            .cell(row, column, row + 1, column, true)
            .string(match.extraInfo.scores.find(o => o.forecastNum === 8).value[0].info.value.toString())
            .style(STYLE_WITH_MBB);
        column++;

        for (const team of ['home', 'guest']) {
            ws.cell(row, column).string(match[team + 'TeamName']).style(STYLE_WITH_TBB);
            ws.cell(row + 1, column).string(match.extraInfo.serial[team].join('').toUpperCase()).style(STYLE_WITH_MBB);
            column++;
        }

        const hpos = match.extraInfo.positions.homeThen;
        const gpos = match.extraInfo.positions.guestThen;
        ws
            .cell(row, column)
            .string(`${hpos}/${gpos} (${Math.abs(hpos - gpos)})`)
            .style(STYLE_WITH_TBB);

        ws
            .cell(row + 1, column)
            .string(match.extraInfo.scores.find(o => o.forecastNum === 7).value[0].info.value.toString())
            .style(STYLE_WITH_MBB);
        column++;

        // forecast 1
        for (const item of [2, 3, 4, 5]) {
            ws
                .cell(row, column)
                .string(match.extraInfo.scores.find(o => o.forecastNum === 1).value.find(o => o.info.matchesCount === item).text)
                .style(STYLE_WITH_TBB);

            ws
                .cell(row + 1, column)
                .string(match.exportAdditionalData.forecast1[item].toString())
                .style(STYLE_WITH_MBB);
            column++;
        }

        // forecast 2
        ws
            .cell(row, column)
            .string(match.extraInfo.scores.find(o => o.forecastNum === 2).value[0].text)
            .style(STYLE_WITH_TBB);
        ws
            .cell(row + 1, column)
            .string(match.exportAdditionalData.forecast2.toString())
            .style(STYLE_WITH_MBB);
        column++;

        //empty
        for (let j = 0; j < 10; j++) {
            ws.cell(row, column).string('').style(STYLE_WITH_TBB);
            ws.cell(row + 1, column++).string('').style(STYLE_WITH_MBB);
        }

        let val = '';
        if (typeof match.homeScore !== 'undefined'
            && typeof match.guestScore !== 'undefined'
            && typeof match.totalScore !== 'undefined'
        ) {
            val = `${match.homeScore} - ${match.guestScore} (${match.totalScore})`;
        }
        ws.cell(row, column, row + 1, column, true).string(val).style(STYLE_WITH_MBB);
        column++;

        row += 2;
    }
}