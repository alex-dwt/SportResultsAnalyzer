import React from 'react';
import { Dropdown } from 'semantic-ui-react'

export default class extends React.Component {
    handleFilterOnChange(value, items) {
        this.props.onChange(this.props.index, items);
    }

    render() {
        return (
            <div>
                <p>{this.getLabel()}</p>
                <Dropdown
                    selection
                    options={this.getValues()}
                    defaultValue={typeof this.props.defaultValue === 'undefined' ? '-' : this.props.defaultValue}
                    onChange={(e, { value }) => this.handleFilterOnChange(value, this.props.items)}
                />
            </div>
        );
    }

    getLabel() {
        return 'No Label';
    }

    getValues(items = []) {
        return [{ value: '', text: '' }]
            .concat(items)
            .map((o) => ({...o, key: o.value === '' ? '-' : o.value}));
    }

    generateDigitsFilterValues(maxValue, initialValue = 1, step = 1) {
        let items = [];
        for (let i = initialValue; i <= maxValue; i += step) {
            items.push({ value: i, text: i })
        }

        return items;
    }
}