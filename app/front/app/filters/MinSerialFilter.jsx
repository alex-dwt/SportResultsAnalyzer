import Filter  from './Filter.jsx'

export default class extends Filter {
    handleFilterOnChange(value, items) {
        super.handleFilterOnChange(
            null,
            value === ''
                ? null
                : this.constructor.doFiltering(items, this.props.payloadCallback, value)
        );
    }

    getLabel() {
        return 'Serial (min)';
    }

    getValues(items = []) {
        return super.getValues(super.generateDigitsFilterValues(10, 0, 0.5));
    }

    static doFiltering(items, scoresCallback, wantedSerial) {
        let result = [];

        for (const item of items) {
            if (scoresCallback(item).find(o => o.forecastNum === 7).value[0].info.value >= wantedSerial) {
                result.push(item);
            }
        }

        return result;
    }
}