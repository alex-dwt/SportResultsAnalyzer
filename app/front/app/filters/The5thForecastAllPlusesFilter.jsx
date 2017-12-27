import Filter  from './Filter.jsx'

export default class extends Filter {
    handleFilterOnChange(value, items) {
        let result = [];

        if (!value) {
            result = null;
        } else {
            for (const item of items) {
                let passed = true;

                for(const score of item.scores.find(o => o.forecastNum === 5).value) {
                    if (score.info.isPassed !== '+') {
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
        return '5 forecast all "+"';
    }

    getValues(items = []) {
        return super.getValues([
            { value: 'yes', text: 'Yes' },
        ]);
    }
}