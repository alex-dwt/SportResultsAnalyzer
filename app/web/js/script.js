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
        $teamSelector.empty().append($('<option></option>').val(''));
        if (!tournamentId) {
            return;
        }
        ajaxCall('/teams/' + tournamentId).done((data) => {
            $.each(data, (key, value) => {
                $teamSelector
                    .append($('<option></option>')
                    .val(value.teamId)
                    .text(value.teamName));
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
                            <td>${value.teamName}</td>
                            <td>${value.statistics.mp}</td>
                            <td>${value.statistics.w}</td>
                            <td>${value.statistics.d}</td>
                            <td>${value.statistics.l}</td>
                            <td>${value.statistics.gf}</td>
                            <td>${value.statistics.ga}</td>
                            <td>${value.statistics.gd}</td>
                            <td>${value.statistics.p}</td>
                            <td>${value.statistics.last5.join(' ').toUpperCase()}</td>
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


    function ajaxCall(url) {
        return $.ajax({
            url: url,
            timeout: 5000
        }).fail((jqXHR) =>  {
            $alert.fadeTo(2000, 500).slideUp(500, () => $alert.slideUp(500)).find('p').text(jqXHR.status);
        });
    }


    fillTournamentsSelector();
});