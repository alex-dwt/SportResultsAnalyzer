$.ajaxSetup ({cache: false});

$(() => {
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

    //forecast (1st)
    let $forecast1TeamASelector = $('#team-a');
    let $forecast1TeamBSelector = $('#team-b');
    let $forecast1TeamATable = $('#forecast-1-table-a').find('tbody').eq(0);
    let $forecast1TeamBTable = $('#forecast-1-table-b').find('tbody').eq(0);
    let $forecast1GoBtn = $('#forecast-1-go-btn').click(() => {
        let teamAId = $forecast1TeamASelector.val();
        let teamBId = $forecast1TeamBSelector.val();
        if (!teamAId || !teamBId || teamAId === teamBId) {
            alert('Wrong teams!');
            return;
        }

        ajaxCall(
            '/forecast1',
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
    });


    let teamSelectors = [
        $teamSelector,
        $forecast1TeamASelector,
        $forecast1TeamBSelector,
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


    function ajaxCall(url, queryParams = {}) {
        return $.ajax({
            url: url,
            timeout: 5000,
            data: queryParams
        }).fail((jqXHR) => alert(jqXHR.status));
    }

    function alert(text) {
        $alert.fadeTo(2000, 500).slideUp(500, () => $alert.slideUp(500)).find('p').text(text);
    }


    fillTournamentsSelector();
});