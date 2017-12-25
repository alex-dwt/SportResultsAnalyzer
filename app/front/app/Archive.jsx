import Request  from './Request.jsx'
import Current  from './Current.jsx'

export default class extends Current {
    loadTournamentsList() {
        return Request.getTournamentsList(sessionStorage.getItem('sport'), true);
    }
}