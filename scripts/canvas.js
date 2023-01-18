Array.prototype.moveToStart = function (ele) {
    this.splice(this.findIndex(e => e == ele), 1)
    this.unshift(ele)
}
Array.prototype.remove = function (ele) {
    const index = this.indexOf(ele);
    if (index > -1) {
        this.splice(index, 1)
    }
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
let edit

class Line {
    constructor(c1, c2) {
        LINES.push(this)

        this.c1 = c1.type == "output" ? c1 : c2;
        this.c2 = c2.type == "input" ? c2 : c1
        c1.lines.push(this)
        c2.lines.push(this)

        this.PATH2D
        document.addEventListener("contextmenu", e => {
            let mouseX = e.clientX - RECT.left, mouseY = e.clientY - RECT.top
            if (ctx.isPointInPath(this.PATH2D, mouseX, mouseY)) {
                LINES.remove(this)
                delete this
            }
        })
    }
    draw() {
        if (this.c1.placement == "TOP" && this.c2.placement == "BOTTOM" && this.c1.y < this.c2.y)
            this.PATH2D = drawLine(this.c1.x, this.c1.y, this.c2.x, this.c2.y, "top-bot")
        else if (this.c1.placement == "BOTTOM" && this.c2.placement == "TOP" && this.c1.y > this.c2.y)
            this.PATH2D = drawLine(this.c2.x, this.c2.y, this.c1.x, this.c1.y, "top-bot")
        else if (this.c1.placement == "LEFT" && this.c2.placement == "TOP" && this.c1.y > this.c2.y)
            this.PATH2D = drawLine(this.c1.x, this.c1.y, this.c2.x, this.c2.y, "left-top-up")
        else if (this.c1.placement == "TOP" && this.c2.placement == "LEFT" && this.c1.y < this.c2.y)
            this.PATH2D = drawLine(this.c2.x, this.c2.y, this.c1.x, this.c1.y, "left-top-up")
        else if (this.c1.placement == "RIGHT" && this.c2.placement == "TOP" && this.c1.y > this.c2.y)
            this.PATH2D = drawLine(this.c1.x, this.c1.y, this.c2.x, this.c2.y, "right-top-up")
        else if (this.c1.placement == "TOP" && this.c2.placement == "RIGHT" && this.c1.y < this.c2.y)
            this.PATH2D = drawLine(this.c2.x, this.c2.y, this.c1.x, this.c1.y, "right-top-up")
        else if (this.c1.placement == "RIGHT" && this.c2.placement == "TOP" && this.c1.x < this.c2.x)
            this.PATH2D = drawLine(this.c2.x, this.c2.y, this.c1.x, this.c1.y, "side-top-down")
        else if (this.c1.placement == "TOP" && this.c2.placement == "RIGHT" && this.c1.x > this.c2.x)
            this.PATH2D = drawLine(this.c1.x, this.c1.y, this.c2.x, this.c2.y, "side-top-down")
        else if (this.c1.placement == "LEFT" && this.c2.placement == "TOP" && this.c1.x > this.c2.x)
            this.PATH2D = drawLine(this.c2.x, this.c2.y, this.c1.x, this.c1.y, "side-top-down")
        else if (this.c1.placement == "TOP" && this.c2.placement == "LEFT" && this.c1.x < this.c2.x)
            this.PATH2D = drawLine(this.c1.x, this.c1.y, this.c2.x, this.c2.y, "side-top-down")
        else
            this.PATH2D = drawLine(this.c1.x, this.c1.y, this.c2.x, this.c2.y)
    }
}

class Connection {
    RADIUS = 3
    constructor(x, y, type, parent) {
        this.x = x; this.y = y;
        this.type = type;
        this.parent = parent
        this.lines = []

        this.placement = undefined
        if (this.y == this.parent.y) this.placement = "TOP"
        if (this.x == this.parent.x) this.placement = "LEFT"
        if (this.y == this.parent.y + this.parent.height) this.placement = "BOTTOM"
        if (this.x == this.parent.x + this.parent.width) this.placement = "RIGHT"

        /**
         * Events
         */
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
                if (!!connFrom && !!tempLine) {
                    if (connFrom.type == this.type || connFrom.parent == this.parent) return
                    new Line(connFrom, this)
                    connFrom = null
                    document.removeEventListener("mousemove", listener, false)
                    return
                }
                connFrom = this
                document.addEventListener("mousemove", listener, false)
            }
        })
        document.addEventListener("mouseup", e => {
            tempLine = null
            let mouseX = e.clientX - RECT.left, mouseY = e.clientY - RECT.top
            if (getDistance(mouseX, mouseY, this.x, this.y) <= this.RADIUS) {
                if (connFrom.type == this.type || connFrom.parent == this.parent) return
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
            new Connection((this.x * 2 + this.width) / 2, this.y + this.height, "output", this)]
        if (type == "stop") this.connections = [
            new Connection((this.x * 2 + this.width) / 2, this.y, "input", this)]
        if (type == "calc" || type == "text") this.connections = [
            new Connection((this.x * 2 + this.width) / 2, this.y + this.height, "output", this),
            new Connection((this.x * 2 + this.width) / 2, this.y, "input", this)]
        if (type == "logic") this.connections = [
            new Connection((this.x * 2 + this.width) / 2, this.y, "input", this),
            new Connection(this.x, (this.y * 2 + this.height) / 2, "output", this),
            new Connection(this.x + this.width, (this.y * 2 + this.height) / 2, "output", this)]

        /**
         * Event Handlers
         */
        document.addEventListener("contextmenu", e => {
            let mouseX = e.clientX - RECT.left, mouseY = e.clientY - RECT.top
            if (mouseX >= this.x && mouseY >= this.y && mouseX <= this.x + this.width && mouseY <= this.y + this.height) {
                this.connections.forEach(c => {
                    c.lines.forEach(l => {
                        LINES.remove(l)
                    })
                });
                NODES.remove(this)
                delete this
            }
        })
        document.addEventListener("dblclick", e => {
            let mouseX = e.clientX - RECT.left, mouseY = e.clientY - RECT.top
            if (mouseX >= this.x && mouseY >= this.y && mouseX <= this.x + this.width && mouseY <= this.y + this.height) {
                if (this.type == "start" || this.type == "stop") return
                edit = document.createElement("input")
                edit.classList.add("edit")
                edit.style.top = this.y + PADDING / 2 - 5 + "px"
                edit.style.left = this.x + PADDING / 2 - 5 + "px"
                edit.style.width = this.width - PADDING + "px"
                edit.addEventListener("focusout", e => {
                    this.updateText(!!edit.value ? edit.value : this.text);
                    document.getElementsByClassName("edit")[0].remove()
                })
                document.body.appendChild(edit)
                edit.focus()
            }
        })
        const listener = e => {
            if (currentDrag !== this) return;
            if (!!document.getElementsByClassName("edit")[0]) document.getElementsByClassName("edit")[0].remove()
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

    updateText(text) {
        this.text = text
        const txtWidth = ctx.measureText(text).width > 50 ? ctx.measureText(text).width : 50
        this.width = txtWidth + PADDING;
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

let GmouseX, GmouseY
document.addEventListener("mousemove", e => {
    GmouseX = e.clientX - RECT.left
    GmouseY = e.clientY - RECT.top
})
document.addEventListener("keypress", e => {
    switch (e.key) {
        case "1": new NODE("start", GmouseX, GmouseY); break
        case "2": new NODE("text", GmouseX, GmouseY, "TEXT"); break
        case "3": new NODE("calc", GmouseX, GmouseY, "CALCULATIONS"); break
        case "4": new NODE("logic", GmouseX, GmouseY, "LOGIC"); break
        case "5": new NODE("stop", GmouseX, GmouseY); break
    }
})

/**
 * MAIN LOOP
 */
const FPS = 120;
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
    ctx.fillText("T", x, y + ((txtHeight + PADDING) / 2) - 10)
    ctx.fillText("N", x + txtWidth + PADDING, y + ((txtHeight + PADDING) / 2 - 10))
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

function drawLine(x1, y1, x2, y2, type = "default") {
    const DISTUP = 20
    const DISTSIDE = 30
    const PATH2D = new Path2D()
    switch (type) {
        case "top-bot":
            PATH2D.moveTo(x1, y1)
            PATH2D.lineTo(x1, y1 - DISTUP)
            PATH2D.lineTo((x1 + x2) / 2, y1 - DISTUP)
            PATH2D.lineTo((x1 + x2) / 2, y2 + DISTUP)
            PATH2D.lineTo(x2, y2 + DISTUP)
            PATH2D.lineTo(x2, y2)
            break
        case "left-top-up":
            PATH2D.moveTo(x1, y1)
            PATH2D.lineTo(x1 - DISTSIDE, y1)
            PATH2D.lineTo(x1 - DISTSIDE, y2 - DISTUP)
            PATH2D.lineTo(x2, y2 - DISTUP)
            PATH2D.lineTo(x2, y2)
            break
        case "right-top-up":
            PATH2D.moveTo(x1, y1)
            PATH2D.lineTo(x1 + DISTSIDE, y1)
            PATH2D.lineTo(x1 + DISTSIDE, y2 - DISTUP)
            PATH2D.lineTo(x2, y2 - DISTUP)
            PATH2D.lineTo(x2, y2)
            break
        case "side-top-down":
            PATH2D.moveTo(x1, y1)
            PATH2D.lineTo(x1, y2)
            PATH2D.lineTo(x2, y2)
            break
        default:
            PATH2D.moveTo(x1, y1)
            PATH2D.lineTo(x1, (y1 + y2) / 2)
            PATH2D.lineTo(x2, (y1 + y2) / 2)
            PATH2D.lineTo(x2, y2)
            break
    }
    ctx.stroke(PATH2D);
    return PATH2D
}