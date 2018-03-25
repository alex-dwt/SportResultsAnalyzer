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

    getPrevMatches(sportType, date) {
        return new Promise((resolve, reject) => axios
            .get(
                `/prev-matches/${sportType}`,
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

    getTournamentsList(sportType, isArchived) {
        return new Promise((resolve, reject) => axios
            .get(
                `/tournaments/${sportType}`,
                {params: {isArchived: isArchived ? 1 : ''}}
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

    createTournamentAnalysisItem(data) {
        return new Promise((resolve, reject) => axios
            .post('/tournament_analysis', data)
            .then(() => resolve())
        );
    },

    getTournamentAnalysisItems() {
        return new Promise((resolve, reject) => axios
            .get('/tournament_analysis')
            .then((res) => resolve(res.data))
        );
    },

    isTournamentAnalysisItemExists(sport, tournamentId, filterId) {
        return new Promise((resolve, reject) => axios
            .get(
                '/tournament_analysis_check',
                {params: {sport, tournamentId, filterId}}
            )
            .then((res) => resolve(res.data.isExists))
        );
    },

    doExport(matchesIds) {
        axios({
            url: '/export',
            method: 'post',
            responseType: 'blob',
            data: {ids: matchesIds}
        })
            .then(res => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'results.xlsx');
                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(link);
                }, 1);
            });
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