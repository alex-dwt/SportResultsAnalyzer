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
    // tournament links to external site
    let $openScoreTableHref = $('#open-score-table-href');
    let $openMatchesTableHref = $('#open-matches-table-href');

    // higlight tables rows on click
    $('table').on('click', 'tbody tr', function(event) {
        if ($(event.target).hasClass('make-favorite-game-sign')) {
            return;
        }

        let action = $(this).hasClass('active-row')
            ? 'removeClass'
            : 'addClass';
        $(this)[action]('active-row');
    });

    // dates
    let $dateFrom = $('#date-from')
        .val(`${(new Date()).getFullYear()}-01-01`)
        .change(() => {
            if (!$dateFrom.val()) {
                $dateFrom.val(`${(new Date()).getFullYear()}-01-01`);
            }
            $tournamentsSelector.val('').change();
        });
    let $dateTill = $('#date-till')
        .val(`${(new Date()).getFullYear()}-12-31`)
        .change(() => {
            if (!$dateTill.val()) {
                $dateTill.val(`${(new Date()).getFullYear()}-12-31`);
            }
            $tournamentsSelector.val('').change();
        });

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
        // set links to external site
        if (id) {
            ajaxCall(`/site_urls/${id}`).done((data) => {
                $openScoreTableHref.attr('href', data.scoreTableUrl);
                $openMatchesTableHref.attr('href', data.matchesUrl);
                $openScoreTableHref.add($openMatchesTableHref).show();

                $('.office-href').each((i, el) => {
                    $(el)
                        .text(data.officesUrls[i].match(/\/\/([^\/]+)\//g)[0].replace(/\//g, ''))
                        .attr('href', data.officesUrls[i])
                }).show();
            });
        } else {
            $openScoreTableHref.add($openMatchesTableHref).hide();
            $('.office-href').hide();
        }
    });
    let $teamSelector = $('#team').change(
        () => buildTeamMatchesTable($tournamentsSelector.val(), $teamSelector.val())
    );

    //forecast
    let $teamASelector = $('#team-a');
    let $teamBSelector = $('#team-b');
    $teamASelector.add($teamBSelector).change(() => {
        $forecast1TeamATable
            .add($forecast1TeamBTable)
            .add($forecast2agfhTable)
            .add($forecast2agahTable)
            .add($forecast2agfgTable)
            .add($forecast2agagTable)
            .add($forecast2AScoreLine)
            .add($forecast2BScoreLine)
            .add($forecast2AMatches)
            .add($forecast2BMatches)
            .empty();
    });
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
        let val = 0.01;
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
            selector.empty().append($('<option></option>').val('')).change();
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
                            <td>(${value.extraInfo.positions.home}) ${value.homeTeamName}</td>
                            <td>${value.homeScore} - ${value.guestScore}</td>
                            <td>${value.guestTeamName} (${value.extraInfo.positions.guest}) </td>
                            <td>${value.extraInfo.scores.join('<br>')}</td>
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
                let res = 0;
                if (parseInt(teamId) === value.homeTeamId) {
                    res = value.homeScore - value.guestScore;
                } else {
                    res = value.guestScore - value.homeScore;
                }
                $teamMatchesTable
                    .append(`
                        <tr class="${(res > 0 ? 'table-success' : (res < 0 ? 'table-danger' : ''))}">
                            <td>${value.date.slice(0, 10)}</td>
                            <td class="${parseInt(teamId) === value.homeTeamId ? 'bold' : ''}">(${value.extraInfo.positions.home}) ${value.homeTeamName}</td>
                            <td>${value.homeScore} - ${value.guestScore}</td>
                            <td class="${parseInt(teamId) === value.guestTeamId ? 'bold' : ''}">${value.guestTeamName} (${value.extraInfo.positions.guest}) </td>
                           <td>${value.extraInfo.scores.join('<br>')}</td>
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
                            <td colspan="3" style="text-align: center; border-bottom: 2px solid black">
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
                table.append(`<tr><td colspan="3" style="border-bottom: 1px solid black"></td></tr>`);
                for (const line of data.comparing[team]) {
                    table.append(`
                        <tr>
                            <td colspan="3" style="text-align: center">
                                ${line.eqType} ${line.count} (${line.text})
                            </td>
                        </tr>
                    `);
                }
                table.append(`<tr><td colspan="3" style="border-top: 1px solid black">
                    ${data.scoreLine[team]}
                </td></tr>`);
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


    function ajaxCall(url, queryParams = {}, method = 'GET') {
        return $.ajax({
            method,
            url: url + '?password=' +encodeURIComponent(getParameterByName('password'))
            + '&dateFrom=' +encodeURIComponent($dateFrom.val())
            + '&dateTill=' +encodeURIComponent($dateTill.val()),
            timeout: 60000,
            data: queryParams,
        }).fail((jqXHR) => alert(jqXHR.status));
    }

    function alert(text) {
        $alert.fadeTo(2000, 500).slideUp(500, () => $alert.slideUp(500)).find('p').text(text);
    }


    fillTournamentsSelector();

    // next matches tab
    let $nextMatchesTable = $('#next-matches-table').find('tbody').eq(0);
    ajaxCall('/next-matches').done((data) => {
        $nextMatchesTable.empty();
        let previousDate = null;
        $.each(data.items, (key, value) => {
            let positionsDiff = data.statistics[value.tournamentId]['teams'][`${value.homeTeamId}-${value.guestTeamId}`];
            let range = Math.round(data.statistics[value.tournamentId]['positionsCount'] / 3);
            let positionType = 'low';
            if (Math.abs(positionsDiff) < range) {
                positionType = 'high';
            } else if (Math.abs(positionsDiff) < range * 2) {
                positionType = 'medium';
            }

            if (previousDate !== null && previousDate !== value.date) {
                $nextMatchesTable
                    .append('<tr><td colspan="8" style="border-top: 3px solid black">&nbsp;</td></tr>');
            }
            previousDate = value.date;
            $nextMatchesTable
                .append(`
                        <tr data-id="${value._id}">
                            <td><span class="icon-star${value.isFavorite ? '' : '-empty'} make-favorite-game-sign"></span></td>
                            <td>${value.tournamentName}</td>
                            <td>${value.date.slice(0, 10)}</td>
                            <td>${value.time}</td>
                            <td>${value.homeTeamName}</td>
                            <td>${value.guestTeamName}</td>
                            <td><span class="team-position ${positionType}">${positionsDiff} / ${data.statistics[value.tournamentId]['positionsCount']}</span></td>
                            <td>${value.scores.join('<br>')}</td>
                        </tr>
                `);
        });
    });

    // make-favorite-unfavorite
    $('body').on('click', '.make-favorite-game-sign', function(e) {
        let $this = $(e.target);
        let isEmpty = $this.hasClass('icon-star-empty');
        ajaxCall(
            '/favorite_game',
            {id: $this.closest('tr').data('id')},
            isEmpty ? 'put' : 'delete'
        ).done(() => $this.removeClass('icon-star-empty icon-star').addClass(isEmpty ? 'icon-star' : 'icon-star-empty'));
    });
});