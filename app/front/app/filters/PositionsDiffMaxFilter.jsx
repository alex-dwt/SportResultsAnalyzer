import Filter  from './Filter.jsx'

export default class extends Filter {
    handleFilterOnChange(value, items) {
        let result = [];

        if (!value) {
            result = null;
        } else {
            for (const item of items) {
                if ((this.props.payloadCallback)(item) <= value) {
                    result.push(item);
                }
            }
        }

        super.handleFilterOnChange(null, result);
    }

    getLabel() {
        return 'Positions difference (max)';
    }

    getValues(items = []) {
        return super.getValues(super.generateDigitsFilterValues(30));
    }
}