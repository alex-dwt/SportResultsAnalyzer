import The5thForecastNoMinusesFilter  from './The5thForecastNoMinusesFilter.jsx'

export default class extends The5thForecastNoMinusesFilter {
    getLabel() {
        return '6 forecast total is calculated';
    }

    static doFiltering(items, scoresCallback) {
        let result = [];

        for (const item of items) {
            if (
                scoresCallback(item)
                    .find(o => o.forecastNum === 6).value
                    .find(o => o.info.type === 'total' && o.info.isPassed === '+')
            ) {
                result.push(item);
            }
        }

        return result;
    }
}