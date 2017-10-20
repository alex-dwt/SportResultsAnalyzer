$(() => {
    let items = [
        {type: 'a', score: '-2', sign: '<'},
        {type: 'a', score: '-2', sign: '<'},
        {type: 'b', score: '-2', sign: '<'},
        {type: 'b', score: '-2', sign: '<'},
        {type: 'b', score: '-2', sign: '<'},
        {type: 'b', score: '-2', sign: '<'},
        {type: 'b', score: '-2', sign: '<'},
        {type: 'a', score: '-7', sign: '<'}
    ];



    let maxGoals = 0;
    let scoresCount = [];
    for (const item of items) {
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


    let divLength = 16;
    let strokeLength = 40;
    if (maxGoals > 2 && maxGoals < 5) {
        divLength = 20;
    } else if (maxGoals > 5 && maxGoals < 8) {
        divLength = 14;
    }


    var canvas = document.getElementById("canvas");
    if (canvas.getContext)
    {
        var ctx = canvas.getContext('2d');

        ctx.font = '14px serif';
        ctx.translate(300, 200);

        // draw coordinates
        ctx.beginPath();
        ctx.moveTo(0,0);
        for (const sign of ['-', '+']) {
            let x = 0;
            for (let i = 0; i <= maxGoals; i++) {
                if (sign === '+' && i === 0) {
                    ;
                } else {
                    drawDiv(x, i * (sign === '-' ? -1 : 1));
                }
                ctx.moveTo(x,0);
                x = eval(`${x} ${sign} ${divLength}`);
                ctx.lineTo(x,0);
                ctx.moveTo(x,0);
            }
        }

        ctx.stroke();

        // draw goals
        for (const item of items) {
            let id = `${item.sign}${item.score}`;
            let o = scoresCount.find(o => o.id === id);
            let ind = scoresCount.findIndex(o => o.id === id);
            let angle = o.angle + o.currentCount * o.angle;
            scoresCount[ind].currentCount++;

            if (item.sign === '<') {
                angle = 180 - angle;
            }
            let x = item.score * divLength;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.setLineDash(item.type === 'a' ? [5] : []);
            ctx.lineTo(x + strokeLength * Math.cos(Math.PI * angle / 180.0), -1 * strokeLength * Math.sin(Math.PI * angle / 180.0));
            ctx.stroke();
        }
    }

    function drawDiv(x, num) {
        ctx.moveTo(x,0);
        ctx.lineTo(x,10);
        ctx.moveTo(x,0);
        ctx.lineTo(x,-10);
        let textX = x - 3;
        if (num < 0) {
            textX = x - 8
        }
        ctx.fillText(num, textX, 24);
    }


});