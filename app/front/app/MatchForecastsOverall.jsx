import React from 'react';
import {render} from 'react-dom';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.canvases = [];
    }

    componentDidMount() {
        this.canvases.map((el) => drawForecast4Canvas(el));
    }

    render() {
        let result = [];
        let k = 0;
        for (const forecast of this.props.forecasts) {
            let el = `${forecast.forecastNum}) `;
            if (forecast.forecastNum === 4) {
                result.push(<p key={k++}>{el}</p>);
                for (const value of forecast.value) {
                    result.push(
                        <canvas key={k++} ref={(el) => {this.canvases.push({el, value})}} className={'forecast4-canvas'}></canvas>
                    );
                }
            } else {
                el += forecast.value.join('; ');
                result.push(<p key={k++}>{el}</p>);
            }
        }
        
        return (
            <div>
                {result}
            </div>
        );
    }
}

function drawForecast4Canvas(canvas)
{
    if (!canvas.el.getContext) {
        return;
    }

    let maxGoals = 0;
    let scoresCount = [];
    for (const item of canvas.value) {
        maxGoals = Math.max(maxGoals, Math.abs(item.score));
        let id = `${item.sign}${item.score}`;
        let index = scoresCount.findIndex(o => o.id === id);
        if (index !== -1) {
            scoresCount[index].count++;
        } else {
            scoresCount.push({id, count: 1, currentCount: 0});
        }
    }

    for(let i = 0; i < scoresCount.length; i++) {
        scoresCount[i].angle = parseInt(85 / (scoresCount[i].count + 1));
    }

    let divLength = 14;
    let strokeLength = 80;
    switch (true) {
        case (maxGoals <= 1):
            divLength = 45;
            break;
        case (maxGoals <= 2):
            divLength = 33;
            break;
        case (maxGoals <= 4):
            divLength = 26;
            break;
        case (maxGoals <= 6):
            divLength = 20;
            break;
        case (maxGoals <= 8):
            divLength = 16;
            break;
    }

    let ctx = canvas.el.getContext('2d');

    ctx.font = '20px serif';
    ctx.translate(150, 100);

    // draw coordinates
    ctx.beginPath();
    ctx.moveTo(0,0);
    for (const sign of ['-', '+']) {
        let x = 0;
        for (let i = 0; i <= maxGoals; i++) {
            if (sign === '+' && i === 0) {
                ;
            } else {
                drawCanvasDiv(
                    ctx,
                    x,
                    i
                );
            }
            ctx.moveTo(x,0);
            x = eval(`${x} ${sign} ${divLength}`);
            ctx.lineTo(x,0);
            ctx.moveTo(x,0);
        }
    }
    ctx.stroke();

    // draw goals
    ctx.lineWidth = 2;
    for (const item of canvas.value) {
        let id = `${item.sign}${item.score}`;
        let o = scoresCount.find(o => o.id === id);
        let ind = scoresCount.findIndex(o => o.id === id);
        let angle = o.angle + o.currentCount * o.angle;
        scoresCount[ind].currentCount++;

        if (item.sign === '<') {
            angle = 180 - angle;
        } else if (item.sign === '=') {
            angle = 90;
        }
        let x = item.score * divLength;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.setLineDash(item.type === 'b' ? [5] : []);
        ctx.lineTo(x + strokeLength * Math.cos(Math.PI * angle / 180.0), -1 * strokeLength * Math.sin(Math.PI * angle / 180.0));
        ctx.stroke();
    }
}

function drawCanvasDiv(ctx, x, num) {
    ctx.moveTo(x,0);
    ctx.lineTo(x,20);
    ctx.moveTo(x,0);
    ctx.lineTo(x,-20);
    let textX = x - 5;
    if (num < 0) {
        textX = x - 8
    }
    ctx.fillText(num, textX, 40);
}