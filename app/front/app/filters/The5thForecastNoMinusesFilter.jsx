import Filter  from './Filter.jsx'

export default class extends Filter {
    handleFilterOnChange(value, items) {
        super.handleFilterOnChange(
            null,
            !value
                ? null
                : this.constructor.doFiltering(items, this.props.payloadCallback)
        );
    }

    getLabel() {
        return '5 forecast no "-"';
    }

    getValues(items = []) {
        return super.getValues([
            { value: 'yes', text: 'Yes' },
        ]);
    }

    static doFiltering(items, scoresCallback) {
        let result = [];

        for (const item of items) {
            let passed = true;
            let scores = scoresCallback(item);

            for(const score of scores.find(o => o.forecastNum === 5).value) {
                if (score.info.isPassed === '-') {
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