$.ajaxSetup ({cache: false});
String.prototype.capitalizeFirstLetter = function(){ return this.charAt(0).toUpperCase() + this.slice(1)};
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(() => {
    // dates
    let $dateFrom = $('#date-from').val(`${(new Date()).getFullYear()}-01-01`);
    let $dateTill = $('#date-till').val(`${(new Date()).getFullYear()}-12-31`);

    let $alert = $('#alert');
    let $scoreTable = $('#score-table').find('tbody').eq(0);
    let $allMatchesTable = $('#all-matches-table').find('tbody').eq(0);
    let $teamMatchesTable = $('#team-matches-table').find('tbody').eq(0);
    let $tournamentsSelector = $('#tournaments').change(() => {
        let id = $tournamentsSelector.val();
        fillTeamsSelector(id);
        buildScoreTable(id);
        buildAllMatchesTable(id);
        buildTeamMatchesTable();
    });
    let $teamSelector = $('#team').change(
        () => buildTeamMatchesTable($tournamentsSelector.val(), $teamSelector.val())
    );

    //forecast
    let $teamASelector = $('#team-a');
    let $teamBSelector = $('#team-b');
    let $forecastGoBtn = $('#forecast-go-btn').click(() => {
        let teamAId = $teamASelector.val();
        let teamBId = $teamBSelector.val();
        if (!teamAId || !teamBId || teamAId === teamBId) {
            alert('Wrong teams!');
            return;
        }

        getForecast1(teamAId, teamBId);
        getForecast2(teamAId, teamBId);
    });

    //forecast (1st)
    let $forecast1TeamATable = $('#forecast-1-table-a').find('tbody').eq(0);
    let $forecast1TeamBTable = $('#forecast-1-table-b').find('tbody').eq(0);

    //forecast (2nd)
    let $forecast2agfhTable = $('#forecast-2-table-agfh').find('tbody').eq(0);
    let $forecast2agahTable = $('#forecast-2-table-agah').find('tbody').eq(0);
    let $forecast2agfgTable = $('#forecast-2-table-agfg').find('tbody').eq(0);
    let $forecast2agagTable = $('#forecast-2-table-agag').find('tbody').eq(0);
    let $forecast2AScoreLine = $('#forecast-2-a-scoreline');
    let $forecast2BScoreLine = $('#forecast-2-b-scoreline');
    let $forecast2AMatches = $('#forecast-2-table-a-matches').find('tbody').eq(0);
    let $forecast2BMatches = $('#forecast-2-table-b-matches').find('tbody').eq(0);
    //fill selectors
    $('.forecast-2-max-matches').each((i, el) => {
        for (let i = 3; i <= 15; i++) {
            $(el).append($('<option></option>').val(i).text(i));
            if (i === 6) {
                $(el).val(i);
            }
        }
    });
    $('.forecast-2-max-teams').each((i, el) => {
        for (let i = 1; i <= 10; i++) {
            $(el).append($('<option></option>').val(i).text(i));
            if (i === 3) {
                $(el).val(i);
            }
        }
    });
    $('.forecast-2-limit').each((i, el) => {
        let val = 0;
        while (val <= 0.5) {
            $(el).append($('<option></option>').val(val).text(val));
            if (val === 0.2) {
                $(el).val(val);
            }
            val = Math.round((val + 0.01) * 100) / 100;
        }
    });
    for (let el of ['forecast-2-limit', 'forecast-2-max-teams', 'forecast-2-max-matches']) {
        $('#' + el).change(() => {
            let val = $('#' + el).val();
            $('.' + el).each((i, el) => {$(el).val(val);});
        });
    }



    let teamSelectors = [
        $teamSelector,
        $teamASelector,
        $teamBSelector,
    ];

    function fillTournamentsSelector() {
        $tournamentsSelector.empty().append($('<option></option>').val(''));
        ajaxCall('/tournaments').done((data) => {
            $.each(data, (key, value) => {
                $tournamentsSelector
                    .append($('<option></option>')
                    .val(value.tournamentId)
                    .text(value.tournamentName));
            });
        });
    }

    function fillTeamsSelector(tournamentId) {
        for (const selector of teamSelectors) {
            selector.empty().append($('<option></option>').val(''));
        }

        if (!tournamentId) {
            return;
        }

        ajaxCall('/teams/' + tournamentId).done((data) => {
            $.each(data, (key, value) => {
                for (const selector of teamSelectors) {
                    selector
                        .append($('<option></option>')
                            .val(value.teamId)
                            .text(value.teamName));
                }
            });
        });
    }

    function buildScoreTable(tournamentId) {
        $scoreTable.empty();

        if (!tournamentId) {
            return;
        }

        ajaxCall('/score-table/' + tournamentId).done((data) => {
            $.each(data, (key, value) => {
                $scoreTable
                    .append(`
                        <tr>
                            <td>${value.position}. ${value.teamName}</td>
                            <td>${value.statistics.mp}</td>
                            <td>${value.statistics.w}</td>
                            <td>${value.statistics.d}</td>
                            <td>${value.statistics.l}</td>
                            <td>${value.statistics.gf}</td>
                            <td>${value.statistics.ga}</td>
                            <td>${value.statistics.agf}</td>
                            <td>${value.statistics.aga}</td>
                            <td>${value.statistics.gd}</td>
                            <td>${value.statistics.p}</td>
                            <td>${value.statistics.last5.join(' ').toUpperCase()}</td>
                            <td>${value.statistics.agfh}</td>
                            <td>${value.statistics.agah}</td>
                            <td>${value.statistics.agfg}</td>
                            <td>${value.statistics.agag}</td>
                        </tr>
                    `);
            });
        });
    }


    function buildAllMatchesTable(tournamentId) {
        $allMatchesTable.empty();

        if (!tournamentId) {
            return;
        }

        ajaxCall('/all-matches-table/' + tournamentId).done((data) => {
            $.each(data, (key, value) => {
                $allMatchesTable
                    .append(`
                        <tr>
                            <td>${value.date.slice(0, 10)}</td>
                            <td>${value.homeTeamName}</td>
                            <td>${value.homeScore} - ${value.guestScore}</td>
                            <td>${value.guestTeamName}</td>
                        </tr>
                    `);
            });
        });
    }


    function buildTeamMatchesTable(tournamentId, teamId) {
        $teamMatchesTable.empty();

        if (!tournamentId || !teamId) {
            return;
        }

        ajaxCall('/team-matches-table/' + tournamentId + '/' + teamId).done((data) => {
            $.each(data, (key, value) => {
                $teamMatchesTable
                    .append(`
                        <tr>
                            <td>${value.date.slice(0, 10)}</td>
                            <td>${value.homeTeamName}</td>
                            <td>${value.homeScore} - ${value.guestScore}</td>
                            <td>${value.guestTeamName}</td>
                        </tr>
                    `);
            });
        });
    }
    
    function getForecast1(teamAId, teamBId) {
        ajaxCall(
            '/forecast/1',
            {tournamentId: $tournamentsSelector.val(), teamAId, teamBId}
        ).done((data) => {
            for (const team of ['A', 'B']) {
                let table = (eval (`$forecast1Team${team}Table`)).empty();
                let teamId = data[`team${team}Id`];
                table.append(`
                        <tr>
                            <td colspan="2" style="text-align: center">
                                AGF - ${data.statistics.find(o => o.teamId === teamId).agf},
                                AGA - ${data.statistics.find(o => o.teamId === teamId).aga}
                            </td>
                        </tr>
                    `);
                for (const match of data.matches[team]) {
                    table.append(`
                        <tr>
                            <td>${match.date.slice(0, 10)}</td>
                            <td>
                                ${match.opponentName}
                                (
                                AGF - ${data.statistics.find(o => o.teamId === match.opponentId).agf},
                                AGA - ${data.statistics.find(o => o.teamId === match.opponentId).aga}
                                )
                            </td>
                            <td>${match.score} - ${match.opponentScore}</td>
                        </tr>
                    `);
                }
            }
        });
    }

    function getForecast2(teamAId, teamBId) {
        let queryParams = {
            tournamentId: $tournamentsSelector.val(),
            teamAId,
            teamBId
        };

        // settings
        for (const team of ['a', 'b']) {
            queryParams['maxMatches' + team.toUpperCase()] =$('#forecast-2-max-matches-' + team).val();
        }
        for (const param of ['max-teams', 'limit']) {
            for (const type of ['agfh', 'agah', 'agfg', 'agag']) {
                queryParams[param.replace('-t', 'T') + type.capitalizeFirstLetter()] =$('#forecast-2-' + param + '-' + type).val();
            }
        }

        ajaxCall('/forecast/2', queryParams).done((data) => {
            // build teams
            for (const team of ['A', 'B']) {
                for (const type of (team === 'A' ? ['agfh', 'agah'] : ['agfg', 'agag'])) {
                    let table = (eval (`$forecast2${type}Table`)).empty();
                    table.append(`
                        <tr><td>
                            ${data[team].team.teamName} (${data[team].team.statistics[type]})
                        </td></tr>
                    `);
                    for (const similarTeam of data[team].similarTeams[type]) {
                        let difference = Math.round((similarTeam.statistics[type] - data[team].team.statistics[type]) * 100) / 100;
                        if (difference >= 0) {
                            difference = '+' + difference;
                        }
                        table.append(`
                        <tr><td>
                            ${similarTeam.teamName} (${similarTeam.statistics[type]}, ${difference})
                        </td></tr>
                    `);
                    }
                }
            }

            //build matches
            for (const team of ['A', 'B']) {
                let table = (eval (`$forecast2${team}Matches`)).empty();
                $.each(data[team].matches, (key, value) => {
                    table
                        .append(`
                            <tr>
                                <td>${value.date.slice(0, 10)}</td>
                                <td>${value.homeTeamName}</td>
                                <td>${value.homeScore} - ${value.guestScore}</td>
                                <td>${value.guestTeamName}</td>
                            </tr>
                        `);
                });
            }

            //build score lines
            for (const team of ['A', 'B']) {
                (eval (`$forecast2${team}ScoreLine`)).text(data[team].scoreLine);
            }
        });
    }


    function ajaxCall(url, queryParams = {}) {
        return $.ajax({
            url: url,
            timeout: 5000,
            data: Object.assign({}, queryParams, {
                dateFrom: $dateFrom.val(),
                dateTill: $dateTill.val(),
                password: getParameterByName('password')
            })

        }).fail((jqXHR) => alert(jqXHR.status));
    }

    function alert(text) {
        $alert.fadeTo(2000, 500).slideUp(500, () => $alert.slideUp(500)).find('p').text(text);
    }


    fillTournamentsSelector();
});