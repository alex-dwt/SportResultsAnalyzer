import React from 'react';
import {render} from 'react-dom';
import { Dropdown } from 'semantic-ui-react'

export default class extends React.Component {
    render() {
        return (
             <div>
                 <p style={{'marginBottom': '5px'}}>Tournament</p>
                 <Dropdown
                     style={{'width': '100%'}}
                     selection
                     options={this.props.items.map((o) => ({...o, 'key': o.value}))}
                     defaultValue={'-'}
                     onChange={(e, { value }) => (this.props.handleClick)(value)}
                 />
             </div>
        );
    }
}