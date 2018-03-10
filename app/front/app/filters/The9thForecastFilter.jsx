import Filter  from './Filter.jsx'

export class The9thForecastFilter extends Filter {
    static ANALYSIS_TYPE_GT_2 = '> 2';
    static ANALYSIS_TYPE_GT_2_AND_HALF = '> 2.5';

    handleFilterOnChange(value, items) {
        super.handleFilterOnChange(
            null,
            !value
                ? null
                : this.constructor.doFiltering(value, items, this.props.payloadCallback)
        );
    }

    getLabel() {
        return '9 forecast';
    }

    getValues(items = []) {
        let values = [];

        for(let i = 2; i <= 4; i++) {
            for(let j = 20; j <= 30; j += 10) {
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
            const info = payloadCallback(item).find(o => o.forecastNum === 9).value[0].info;
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

    static doAnalysis(
        matches,
        filteredIds,
        type = The9thForecastFilter.ANALYSIS_TYPE_GT_2
    ) {
        let positiveFilteredItemsIds = [];
        let negativeFilteredItemsIds = [];
        let neutralFilteredItemsIds = [];

        for (const id of filteredIds) {
            let item = matches.find((o) => o._id === id);
            if (item) {
                if (type === The9thForecastFilter.ANALYSIS_TYPE_GT_2) {
                    if (item.totalScore > 2) {
                        positiveFilteredItemsIds.push(item._id);
                    } else if (item.totalScore < 2) {
                        negativeFilteredItemsIds.push(item._id);
                    }
                } else if (type === The9thForecastFilter.ANALYSIS_TYPE_GT_2_AND_HALF) {
                    if (item.totalScore > 2) {
                        positiveFilteredItemsIds.push(item._id);
                    } else {
                        negativeFilteredItemsIds.push(item._id);
                    }
                }
            }
        }

        return [
            positiveFilteredItemsIds,
            negativeFilteredItemsIds,
            neutralFilteredItemsIds,
        ];
    }
}