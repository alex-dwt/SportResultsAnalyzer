import React from 'react';
import {render} from 'react-dom';
import Archive from './Archive.jsx';
import Home from './Home.jsx';
import Current from './Current.jsx';
import Next from './Next.jsx';
import Settings from './Settings.jsx';
import { Dropdown, Menu } from 'semantic-ui-react'
import {
    Router,
    Route,
    NavLink,
} from 'react-router-dom'
import createBrowserHistory from 'history/createBrowserHistory'

export class App extends React.Component {

    static SPORT_TYPE_FOOTBALL = 'soccer';

    constructor(props) {
        super(props);
        this.history = createBrowserHistory();
        sessionStorage.setItem('password', getParameterByName('password'));
        sessionStorage.setItem('sport', App.SPORT_TYPE_FOOTBALL);
    }

    componentDidMount() {
        this.history.push('/');
    }

    render() {
        return (
            <div style={{'margin': '0 10px'}}>
                <Router history={this.history}>
                    <div>
                        <Dropdown
                            selection
                            options={[
                                { value: App.SPORT_TYPE_FOOTBALL, text: 'Football', key: App.SPORT_TYPE_FOOTBALL },
                                { value: 'basketball', text: 'Basketball', key: 'basketball' },
                            ]}
                            defaultValue={App.SPORT_TYPE_FOOTBALL}
                            onChange={(e, { value }) => {
                                sessionStorage.setItem('sport', value);
                                this.history.push('/');
                            }}
                        />

                        <Menu>
                            <Menu.Item as={NavLink} to='/' exact>Home</Menu.Item>
                            <Menu.Item as={NavLink} to='/next' exact>Next</Menu.Item>
                            <Menu.Item as={NavLink} to='/current'>Current</Menu.Item>
                            <Menu.Item as={NavLink} to='/archive'>Archive</Menu.Item>
                            <Menu.Item as={NavLink} to='/settings' position="right">Settings</Menu.Item>
                        </Menu>

                        <Route exact path="/" component={Home}/>
                        <Route exact path="/next" component={Next}/>
                        <Route path="/current" component={Current}/>
                        <Route path="/archive" component={Archive}/>
                        <Route path="/settings" component={Settings}/>
                    </div>
                </Router>
            </div>
        );
    }
}

render(<App/>, document.getElementById('app'));

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return '';
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}