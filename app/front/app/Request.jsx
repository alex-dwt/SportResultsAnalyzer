import axios from 'axios';

export default {
    getNextMatches(sportType, date) {
        return new Promise((resolve, reject) => axios
            .get(
                `/next-matches/${sportType}`,
                {params: {date: date.format('YYYY-MM-DD')}}
            )
            .then((res) => resolve(res.data))
        );
    },

    getTeamMatches(sportType, tournamentId, teamId) {
        return new Promise((resolve, reject) => axios
            .get(`/team-matches-table/${sportType}/${tournamentId}/${teamId}`)
            .then((res) => resolve(res.data))
        );
    },

    getTournamentsList(sportType, isArchive) {
        return new Promise((resolve, reject) => axios
            .get(
                `/tournaments/${sportType}`,
                {params: {isArchived: isArchive ? 1 : ''}}
            )
            .then((res) => resolve(res.data))
        );
    },

    getTournamentUrls(sportType, tournamentId) {
        return new Promise((resolve, reject) => axios
            .get(`/site_urls/${sportType}/${tournamentId}`)
            .then((res) => resolve(res.data))
        );
    },

    getTournamentScoreTable(sportType, tournamentId) {
        return new Promise((resolve, reject) => axios
            .get(`/score-table/${sportType}/${tournamentId}`)
            .then((res) => resolve(res.data))
        );
    },

    getAllMatches(sportType, tournamentId) {
        return new Promise((resolve, reject) => axios
            .get(`/all-matches-table/${sportType}/${tournamentId}`)
            .then((res) => resolve(res.data))
        );
    },

    getTournamentTeams(sportType, tournamentId) {
        return new Promise((resolve, reject) => axios
            .get(`/teams/${sportType}/${tournamentId}`)
            .then((res) => resolve(res.data))
        );
    },
}

axios.interceptors.request.use((config) => {
    let params = config.params || {};
    params.password = sessionStorage.getItem('password');
    params.timestamp = + new Date();
    params.dateFrom = '2000-01-01';
    params.dateTill = '2020-12-31';

    return {...config, params};
});