import React from 'react';
import { Dropdown } from 'semantic-ui-react'

export default class extends React.Component {
    handleFilterOnChange(value, items) {
        this.props.onChange(
            this.props.index,
            items === null ? null : items.map((o) => o._id)
        );
    }

    render() {
        return (
            <div>
                <p>{this.getLabel()}</p>
                <Dropdown
                    selection
                    options={this.getValues()}
                    defaultValue="-"
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
            .map((o) => ({...o, key: o.value || '-'}));
    }

    generateDigitsFilterValues(count) {
        let items = [];
        for (let i = 1; i <= count; i++) {
            items.push({ value: i, text: i })
        }

        return items;
    }
}