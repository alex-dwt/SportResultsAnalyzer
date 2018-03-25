import React from 'react';
import { Button } from 'semantic-ui-react'
import Request  from '../Request.jsx'

export default class extends React.Component {
    render() {
        return (
            <Button
                style={{marginTop: '10px'}}
                onClick={() => this.handleClick()}
                disabled={this.props.disabled}
            >
                Export
            </Button>
        );
    }

    handleClick() {
        Request.doExport(this.props.filteredItemsIds);
    }
}