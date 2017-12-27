import Filter  from './Filter.jsx'

export default class extends Filter {
    handleFilterOnChange(value, items) {
        let result = [];

        if (!value) {
            result = null;
        } else {
            for (const item of items) {
                let passed = true;
                let scores = (this.props.payloadCallback)(item);

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
        }

        super.handleFilterOnChange(null, result);
    }

    getLabel() {
        return '5 forecast no "-"';
    }

    getValues(items = []) {
        return super.getValues([
            { value: 'yes', text: 'Yes' },
        ]);
    }
}