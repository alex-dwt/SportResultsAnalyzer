import Request  from './Request.jsx'
import Next  from './Next.jsx'

export default class extends Next {
    loadMatches(sport, date) {
        return Request.getPrevMatches(sport, date);
    }

    handleChangeTab(e, data, item) {
        ;
    }
}