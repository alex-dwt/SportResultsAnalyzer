import React from 'react';
import { Button } from 'semantic-ui-react'

export default class extends React.Component {
    render() {
        return (
            <Button
                style={{marginTop: '10px'}}
                onClick={() => this.props.onClick()}
                disabled={this.props.disabled}
            >
                Filter
            </Button>
        );
    }
}