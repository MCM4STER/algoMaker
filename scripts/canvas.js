const CANVAS = document.getElementById("canvas")
const ctx = CANVAS.getContext("2d")
const PADDING = 30
const TXTHEIGHT = 12
const NODES = []
class NODE {
    TYPES = {
        "calc": drawCalcNode,
        "text": drawTextNode,
        "logic": drawLogicNode
    }
    constructor(type, x, y, text = "") {
        NODES.push(this)
        this.x = x; this.y = y;
        this.text = text
        const txtWidth = ctx.measureText(text).width > 50 ? ctx.measureText(text).width : 50
        this.width = txtWidth + PADDING; this.height = TXTHEIGHT + PADDING;
        this.type = type
        document.addEventListener("mousedown", e => {
            document.addEventListener("mousemove", e => this.move(e))
        }, true)
        document.addEventListener("mouseup", e => {
            console.log("test")
            document.removeEventListener("mousemove", e => this.move(e))
        }, true)
    }
    move(e) {
        let rect = CANVAS.getBoundingClientRect();
        let mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top
        if (mouseX >= this.x && mouseY >= this.y && mouseX <= this.x + this.width && mouseY <= this.y + this.height) {
            this.x = this.x + e.movementX
            this.y = this.y + e.movementY
        }
    }

    draw() {
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        if (this.type == "start" || this.type == "stop")
            drawStartStopNode(this.x, this.y, this.type.toUpperCase())
        else
            this.TYPES[this.type](this.x, this.y, this.text)
    }
}

new NODE("start", 100, 100)
new NODE("text", 100, 150, "podaj a")
new NODE("calc", 100, 200, "a+=6")
new NODE("logic", 100, 250, "a==5")
new NODE("stop", 100, 350)
drawLine(10, 10, 200, 400)

const FPS = 60;
setInterval(() => {
    ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
    NODES.forEach(e => e.draw())
}, 1000 / FPS)

//------------------------------------------------------

function drawCalcNode(x, y, text) {
    ctx.font = `${TXTHEIGHT}px serif`
    const txtWidth = ctx.measureText(text).width > 50 ? ctx.measureText(text).width : 50
    ctx.beginPath();
    ctx.rect(x, y, txtWidth + PADDING, TXTHEIGHT + PADDING)
    ctx.stroke();
    ctx.fillText(text, x + ((txtWidth + PADDING) / 2), y + ((TXTHEIGHT + PADDING) / 2))
}

function drawTextNode(x, y, text) {
    const txtHeight = 12
    const OFFSET = 10
    ctx.font = `${txtHeight}px serif`
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