import MinSerialFilter  from './MinSerialFilter.jsx'

export default class extends MinSerialFilter {
    getLabel() {
        return 'Serial (max)';
    }

    static doFiltering(items, scoresCallback, wantedSerial) {
        let result = [];

        for (const item of items) {
            if (scoresCallback(item).find(o => o.forecastNum === 7).value[0].info.value <= wantedSerial) {
                result.push(item);
            }
        }

        return result;
    }
}