import Filter  from './Filter.jsx'

export default class extends Filter {
    handleFilterOnChange(value, items) {
        super.handleFilterOnChange(
            null,
            !value
                ? null
                : this.constructor.doFiltering(value, items, this.props.payloadCallback)
        );
    }

    getLabel() {
        return '10 forecast';
    }

    getValues(items = []) {
        let values = [];

        for(let i = 2; i <= 3; i++) {
            for(let j = 60; j <= 80; j += 10) {
                for(const sign of ['>', '>>']) {
                    values.push({
                        value: `${i}:${j}:${sign}`,
                        text: `${i}: ${sign}${j}%`
                    });
                }
            }
        }

        return super.getValues(values);
    }

    static doFiltering(value, items, payloadCallback) {
        let result = [];

        value = value.split(':');

        for (const item of items) {
            const info = payloadCallback(item).find(o => o.forecastNum === 10).value[0].info;
            const goalsInfo = info.find(o => o.goalsCount == value[0]);
            if (goalsInfo) {
                if (
                    (value[2] === '>>' && (
                        goalsInfo.homeTeamPercent > value[1] &&
                        goalsInfo.guestTeamPercent > value[1]
                    )) ||
                    (value[2] === '>' && (
                        goalsInfo.homeTeamPercent >= value[1] ||
                        goalsInfo.guestTeamPercent >= value[1]
                    ))
                ) {
                    result.push(item);
                }
            }
        }

        return result;
    }
}