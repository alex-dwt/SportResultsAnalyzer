import Filter  from './Filter.jsx'

export default class extends Filter {
    handleFilterOnChange(value, items) {
        let result = [];

        if (!value) {
            result = null;
        } else {
            for (const item of items) {
                let positionDifference = (this.props.payloadCallback)(item);
                if ((value === 'home' && positionDifference > 0) ||
                    (value === 'guest' && positionDifference < 0)
                ) {
                    result.push(item);
                }
            }
        }

        super.handleFilterOnChange(null, result);
    }

    getLabel() {
        return 'Which team is stronger';
    }

    getValues(items = []) {
        return super.getValues([
            { value: 'home', text: 'Home' },
            { value: 'guest', text: 'Guest' },
        ]);
    }
}