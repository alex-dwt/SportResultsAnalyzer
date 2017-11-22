import React from 'react';
import {render} from 'react-dom';
import NextMatches from './NextMatches.jsx';

class App extends React.Component {
    render() {
        return (
            <div>
                <NextMatches/>
            </div>
        );
    }
}

render(<App/>, document.getElementById('app'));