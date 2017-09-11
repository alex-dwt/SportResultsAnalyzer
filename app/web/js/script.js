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
        $tournamentsSelector.empty().append($('<option>-</option>').val(''));
        ajaxCall('/tournaments').done((data) => {
            $.each(data, (key, value) => {
                $tournamentsSelector.append($('<option></option>').val(value.id).text(value.name));
            });
        });
    }

    function fillTeamsSelector(tournamentId) {
        $teamSelector.empty().append($('<option>-</option>').val(''));
        if (tournamentId) {
            return;
        }
        ajaxCall('/teams/' + tournamentId).done((data) => {
            $.each(data, (key, value) => {
                $teamSelector.append($('<option></option>').val(value.id).text(value.name));
            });
        });
    }

    function buildScoreTable(tournamentId) {
        $scoreTable.empty();

        if (!tournamentId) {
            return;
        }

        ajaxCall('/score-table/' + tournamentId).done((data) => {

        });
    }


    function buildAllMatchesTable(tournamentId) {
        $allMatchesTable.empty();

        if (!tournamentId) {
            return;
        }

        ajaxCall('/all-matches-table/' + tournamentId).done((data) => {

        });
    }


    function buildTeamMatchesTable(tournamentId, teamId) {
        $teamMatchesTable.empty();

        if (!tournamentId || teamId) {
            return;
        }

        ajaxCall('/team-matches-table/' + tournamentId + '/' + teamId).done((data) => {

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