export default {
    // 这里的position为经纬度（弧度）
    createLabel(earth, position: Array<number>, title: string = '未知值', backgroundcolor: string = 'rgba(51,161,201,0.8)') {
        const p = new XE.Obj.Pin(earth);
        p.position = position;
        p.show = false;

        const labelDiv = document.createElement('div');
        p.labelDiv = labelDiv
        labelDiv.setAttribute('style', 'width: 300px;height: 200px;position: absolute;pointer-events: none;')
        earth.czm.viewer.container.appendChild(labelDiv);

        const labelCanvas = document.createElement('canvas');
        // labelCanvas.style = `
        //     width: 100%;
        //     height: 100%;
        // `;
        labelCanvas.setAttribute("id", "mylabelCanvas");
        labelCanvas.setAttribute('style', 'width: 100%;height: 100%;')
        labelCanvas.width = 300;
        labelCanvas.height = 200;
        labelDiv.appendChild(labelCanvas);

        const ctx = labelCanvas.getContext('2d')!;

        //------------------------------------背景色---------------------------------
        ctx.font = "16px console";
        const width = ctx.measureText(title).width + 8;
        drawlabel(ctx, width, backgroundcolor, title);

        // p.winPos 为一个含有4个元素的数组，分别表示[left, top, right, bottom]
        const unwatch = XE.MVVM.watch(() => [...p.winPos], winPos => {
            console.log(`winPos: ${winPos.toString()}`);
            labelDiv.style.left = `${winPos[0]}px`;
            labelDiv.style.bottom = `${winPos[3]}px`;
        });
        //销毁过程语句
        // p.destroyEvalString = `earth.czm.viewer.container.removeChild(p.labelDiv);`
        p.disposers.push(() => {
            if (p.labelDiv) {
                earth.czm.viewer.container.removeChild(p.labelDiv);
                p.labelDiv = undefined;
            }
        });
        p.disposers.push(() => { unwatch && unwatch(); });
        return p
        // return function () {
        //     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // }
    },
    updateLabelTitle(p: any, title: string, backgroundcolor: string = 'rgba(51,161,201,0.8)') {
        // 这是获取canvas的一个方法，但考虑后期会有多个canvas同时出现在earth,所以舍弃这种方式
        // const labelCanvas = document.getElementById('mylabelCanvas') as HTMLCanvasElement;
        // 以下这种方法获取canvas元素的方式感觉有点旁门左道，有知道更好方式的伙伴请补充
        const labelCanvas = p.labelDiv.lastChild;

        const ctx = labelCanvas!.getContext('2d')!;
        ctx.font = "16px console";
        const width = ctx.measureText(title).width + 8;
        drawlabel(ctx, width, backgroundcolor, title);
    },
    updateLabelposition(p: any, position) {
        p.position = position;
    }
}
/*radius-矩形背景的四个角的半径弧度；width-矩形背景的宽度；height-矩形背景的高度,x-矩形背景的左下角x坐标；y-矩形背景的左下角y坐标;backgroundcolor-矩形背景的颜色；title-矩形背景上的文字*/
function drawlabel(ctx: any, width: number, backgroundcolor: string, title: string) {
    const radius = 4;
    const height = 24;
    const x = 106;
    const y = 72;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    ctx.moveTo(x, y);
    // 顺时针绘制
    //左上角圆弧，弧度从PI到3/2PI  
    ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    //上边线  
    ctx.lineTo(x + width - radius, y);
    //右上角圆弧  
    ctx.arc(x + width - radius, y + radius, radius, Math.PI * 3 / 2, Math.PI * 2);
    //右边线  
    ctx.lineTo(x + width, y + height - radius);
    //从右下角，弧度从0到1/2PI  
    ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
    //矩形下边线  
    ctx.lineTo(x + radius, y + height);
    //左下角圆弧，弧度从1/2PI到PI  
    ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI);
    //矩形左边线  
    ctx.lineTo(x, y + radius);
    ctx.fillStyle = backgroundcolor;
    ctx.fill();

    //这里的标注文字代码要放在背景色代码之后，因为后绘制的内容会覆盖前绘制内容
    //------------------------------------标注文字---------------------------------
    ctx.strokeStyle = 'rgb(255, 255, 0)';
    ctx.beginPath();
    ctx.lineTo(0, 200);
    ctx.lineTo(100, 100);
    ctx.lineTo(width + 114, 100);
    ctx.stroke();
    // ctx.font = "16px console";
    // ctx.textBaseline = "middle";
    ctx.fillStyle = 'rgb(255, 255, 0)';
    ctx.fillText(title, 110, 90);
    ctx.closePath();
}