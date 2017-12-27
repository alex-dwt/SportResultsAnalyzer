import Filter  from './Filter.jsx'

export default class extends Filter {
    handleFilterOnChange(value, items) {
        let result = [];

        if (!value) {
            result = null;
        } else {
            value = value.split(':');

            for (const item of items) {
                let scores = item.scores.find(o => o.forecastNum === 1).value;

                let passed = true;

                for (let i = 2; i <= value[0]; i++) {
                    let val = scores.find(o => o.info.matchesCount === i);
                    if (!val) {
                        passed = false;
                        break;
                    }
                    let score1 = val.info.homeScore > 0 ? val.info.homeScore : 0;
                    let score2 = val.info.guestScore > 0 ? val.info.guestScore : 0;
                    if (Math.abs(Math.round((score1 - score2) * 100) / 100) < value[1]) {
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
        return 'First forecast goals difference (min)';
    }

    getValues(items = []) {
        let values = [];

        for (let i = 2; i <= 3; i++) {
            let j = 0;
            while (j < 2) {
                j = Math.round((j + 0.05) * 100) / 100;
                values.push({
                    value: `${i}:${j}`,
                    text: `${j} (${i})`
                });
            }
        }

        return super.getValues(values);
    }
}