const ctx = document.getElementById("canvas").getContext("2d")
const PADDING = 30

class NODE {
    TYPES = {
        "calc": drawCalcNode,
        "text": drawTextNode,
        "logic": drawLogicNode
    }
    constructor(type, x, y, text = "") {
        if (type == "start" || type == "stop") {
            drawStartStopNode(x, y, type.toUpperCase())
            return
        }
        this.TYPES[type](x, y, text)
    }
}
function drawCalcNode(x, y, text) {
    const txtHeight = 12
    ctx.font = `${txtHeight}px serif`
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const txtWidth = ctx.measureText(text).width > 50 ? ctx.measureText(text).width : 50
    ctx.beginPath();
    ctx.rect(x, y, txtWidth + PADDING, txtHeight + PADDING)
    ctx.stroke();
    ctx.fillText(text, x + ((txtWidth + PADDING) / 2), y + ((txtHeight + PADDING) / 2))
}

function drawTextNode(x, y, text) {
    const txtHeight = 12
    const OFFSET = 10
    ctx.font = `${txtHeight}px serif`
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const txtWidth = ctx.measureText(text).width > 50 ? ctx.measureText(text).width : 50
    ctx.beginPath();
    ctx.moveTo(x + OFFSET, y)
    ctx.lineTo(x + OFFSET + txtWidth + PADDING, y)
    ctx.lineTo(x - OFFSET + txtWidth + PADDING, y + txtHeight + PADDING)
    ctx.lineTo(x - OFFSET, y + txtHeight + PADDING)
    ctx.lineTo(x + OFFSET, y)
    ctx.stroke();
    ctx.fillText(text, x + ((txtWidth + PADDING) / 2), y + ((txtHeight + PADDING) / 2))
}

function drawLogicNode(x, y, text) {
    const txtHeight = 12
    ctx.font = `${txtHeight}px serif`
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const txtWidth = ctx.measureText(text).width > 50 ? ctx.measureText(text).width : 50
    ctx.beginPath();
    ctx.moveTo((2 * x + txtWidth + PADDING) / 2, y)
    ctx.lineTo(x + txtWidth + PADDING, (2 * y + txtHeight + PADDING) / 2)
    ctx.lineTo((2 * x + txtWidth + PADDING) / 2, y + txtHeight + PADDING)
    ctx.lineTo(x, (2 * y + txtHeight + PADDING) / 2)
    ctx.lineTo((2 * x + txtWidth + PADDING) / 2, y)
    ctx.stroke();
    ctx.fillText(text, x + ((txtWidth + PADDING) / 2), y + ((txtHeight + PADDING) / 2))
}

function drawStartStopNode(x, y, text = "START") {
    const txtHeight = 12
    ctx.font = `${txtHeight}px serif`
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const txtWidth = ctx.measureText(text).width > 50 ? ctx.measureText(text).width : 50
    ctx.beginPath();
    ctx.roundRect(x, y, txtWidth + PADDING, txtHeight + PADDING, 50)
    ctx.stroke();
    ctx.fillText(text, x + ((txtWidth + PADDING) / 2), y + ((txtHeight + PADDING) / 2))
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1)
    ctx.lineTo(x1, (y1 + y2) / 2)
    ctx.lineTo(x2, (y1 + y2) / 2)
    ctx.lineTo(x2, y2)
    ctx.stroke();
}


new NODE("start", 100, 100)
new NODE("text", 100, 150, "podaj a")
new NODE("calc", 100, 200, "a+=6")
new NODE("logic", 100, 250, "a==5")
new NODE("stop", 100, 350)