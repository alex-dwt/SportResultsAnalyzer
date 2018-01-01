import The5thForecastNoMinusesFilter  from './The5thForecastNoMinusesFilter.jsx'

export default class extends The5thForecastNoMinusesFilter {
    getLabel() {
        return '5 forecast all "+"';
    }

    static doFiltering(items, scoresCallback) {
        let result = [];

        for (const item of items) {
            let passed = true;
            let scores = scoresCallback(item);

            for(const score of scores.find(o => o.forecastNum === 5).value) {
                if (score.info.isPassed !== '+') {
                    passed = false;
                    break;
                }
            }

            if (passed) {
                result.push(item);
            }
        }

        return result;
    }
}