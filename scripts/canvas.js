Array.prototype.moveToStart = function (ele) {
    this.splice(this.findIndex(e => e == ele), 1)
    this.unshift(ele)
}

const CANVAS = document.getElementById("canvas")
const RECT = CANVAS.getBoundingClientRect();
const ctx = CANVAS.getContext("2d")
const PADDING = 30
const TXTHEIGHT = 12
const NODES = []
const LINES = []

let tempLine = null
let currentDrag = null
let connFrom = null

class Line {
    constructor(c1, c2) {
        LINES.push(this)
        this.c1 = c1; this.c2 = c2
    }
    draw() {
        drawLine(this.c1.x, this.c1.y, this.c2.x, this.c2.y)
    }
}

class Connection {
    RADIUS = 3
    constructor(x, y, type) {
        this.x = x; this.y = y;
        this.type = type;
        document.addEventListener("mousemove", e => {
            let mouseX = e.clientX - RECT.left, mouseY = e.clientY - RECT.top
            if (getDistance(mouseX, mouseY, this.x, this.y) > this.RADIUS) {
                this.RADIUS = 3
                return
            }
            currentDrag = null
            this.RADIUS = 5
        }, false)

        const listener = e => {
            let mouseX = e.clientX - RECT.left, mouseY = e.clientY - RECT.top
            tempLine = { x1: this.x, y1: this.y, x2: mouseX, y2: mouseY }
        }
        document.addEventListener("mousedown", e => {
            let mouseX = e.clientX - RECT.left, mouseY = e.clientY - RECT.top
            if (getDistance(mouseX, mouseY, this.x, this.y) <= this.RADIUS) {
                connFrom = this
                document.addEventListener("mousemove", listener, false)
            }
        })
        document.addEventListener("mouseup", e => {
            tempLine = null
            let mouseX = e.clientX - RECT.left, mouseY = e.clientY - RECT.top
            if (getDistance(mouseX, mouseY, this.x, this.y) <= this.RADIUS) {
                new Line(connFrom, this)
            }
            document.removeEventListener("mousemove", listener, false)
        })
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.RADIUS, 0, 2 * Math.PI)
        ctx.fillStyle = 'white'
        ctx.fill()
        ctx.stroke()
        ctx.strokeStyle = 'black'
    }
}
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
        this.type = type

        const txtWidth = ctx.measureText(text).width > 50 ? ctx.measureText(text).width : 50
        this.width = txtWidth + PADDING; this.height = TXTHEIGHT + PADDING;

        this.connections = []
        if (type == "start") this.connections = [
            new Connection((this.x * 2 + this.width) / 2, this.y + this.height, "output")]
        if (type == "stop") this.connections = [
            new Connection((this.x * 2 + this.width) / 2, this.y, "input")]
        if (type == "calc" || type == "text") this.connections = [
            new Connection((this.x * 2 + this.width) / 2, this.y + this.height, "output"),
            new Connection((this.x * 2 + this.width) / 2, this.y, "input")]
        if (type == "logic") this.connections = [
            new Connection((this.x * 2 + this.width) / 2, this.y, "input"),
            new Connection(this.x, (this.y * 2 + this.height) / 2, "output"),
            new Connection(this.x + this.width, (this.y * 2 + this.height) / 2, "output")]

        /**
         * Draging Handler
         */
        const listener = e => {
            if (currentDrag !== this) return;
            this.x += e.movementX
            this.y += e.movementY
            this.connections.forEach(connection => { connection.x += e.movementX; connection.y += e.movementY })
        }
        document.addEventListener("mousedown", e => {
            let mouseX = e.clientX - RECT.left, mouseY = e.clientY - RECT.top
            if (mouseX >= this.x && mouseY >= this.y && mouseX <= this.x + this.width && mouseY <= this.y + this.height) {
                currentDrag = this
                document.addEventListener("mousemove", listener, false)
            }
        })
        document.addEventListener("mouseup", e => {
            document.removeEventListener("mousemove", listener, false)
        })
    }

    draw() {
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        if (this.type == "start" || this.type == "stop")
            drawStartStopNode(this.x, this.y, this.type.toUpperCase())
        else
            this.TYPES[this.type](this.x, this.y, this.text)
        this.connections.forEach(e => e.draw())
    }
}

new NODE("start", 100, 100)
new NODE("text", 100, 150, "podaj a")
new NODE("calc", 100, 200, "a+=6")
new NODE("logic", 100, 250, "a==5")
new NODE("stop", 100, 350)

/**
 * MAIN LOOP
 */
const FPS = 30;
setInterval(() => {
    ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
    NODES.forEach(e => e.draw())
    LINES.forEach(e => e.draw())
    if (!!tempLine) drawLine(tempLine.x1, tempLine.y1, tempLine.x2, tempLine.y2)
}, 1000 / FPS)

//------------------------------------------------------

function getDistance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}
// DRAWING FUNCTIONS
function drawCalcNode(x, y, text) {
    ctx.font = `${TXTHEIGHT}px serif`
    const txtWidth = ctx.measureText(text).width > 50 ? ctx.measureText(text).width : 50
    ctx.beginPath();
    ctx.rect(x, y, txtWidth + PADDING, TXTHEIGHT + PADDING)
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.stroke();
    ctx.fillStyle = "black"
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
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.stroke();
    ctx.fillStyle = "black"
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
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.stroke();
    ctx.fillStyle = "black"
    ctx.fillText(text, x + ((txtWidth + PADDING) / 2), y + ((txtHeight + PADDING) / 2))
}

function drawStartStopNode(x, y, text = "START") {
    const txtHeight = 12
    ctx.font = `${txtHeight}px serif`
    const txtWidth = ctx.measureText(text).width > 50 ? ctx.measureText(text).width : 50
    ctx.beginPath();
    ctx.roundRect(x, y, txtWidth + PADDING, txtHeight + PADDING, 50)
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.stroke();
    ctx.fillStyle = "black"
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