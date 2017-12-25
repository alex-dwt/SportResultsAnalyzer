import React from 'react';
import {render} from 'react-dom';
import Request  from './Request.jsx'
import { Button } from 'semantic-ui-react'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            officesUrls: [],
            scoreTableUrl: '',
            matchesUrl: '',
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.tournamentId && this.props.tournamentId !== nextProps.tournamentId) {
            Request.getTournamentUrls(sessionStorage.getItem('sport'), nextProps.tournamentId)
                .then((data) => this.setState({
                    officesUrls: data.officesUrls,
                    scoreTableUrl: data.scoreTableUrl,
                    matchesUrl: data.matchesUrl,
                }));
        }
    }

    render() {
        return (
           <div style={{marginTop: '5px'}}>
               <Button onClick={(e) => window.open(this.state.scoreTableUrl, '_blank')} disabled={!this.state.scoreTableUrl}>
                   Open score table
               </Button>
               <Button onClick={(e) => window.open(this.state.matchesUrl, '_blank')} disabled={!this.state.matchesUrl}>
                   Open matches
               </Button>

               <div style={{float: 'right'}}>
                   {this.state.officesUrls.map((url) => (
                       <Button key={url} onClick={(e) => window.open(url, '_blank')}>
                           {url.match(/\/\/([^\/]+)\//g)[0].replace(/\//g, '')}
                       </Button>
                   ))}
               </div>
           </div>
        );
    }
}