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
        this.PATH2D = new Path2D()

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
            if (!ctx.isPointInPath(this.PATH2D, mouseX, mouseY)) {
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
            if (ctx.isPointInPath(this.PATH2D, mouseX, mouseY)) {
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

    update() {
        switch (this.placement) {
            case "BOTTOM":
                this.y = this.parent.y + this.parent.height
            case "TOP":
                this.x = this.parent.xCenter
                break
            case "RIGHT":
                this.x = this.parent.x + this.parent.width
            case "LEFT":
                this.y = (this.parent.y * 2 + this.parent.height) / 2
                break
        }
    }

    draw() {
        this.PATH2D = new Path2D()
        this.PATH2D.arc(this.x, this.y, this.RADIUS, 0, 2 * Math.PI)
        ctx.fillStyle = 'white'
        ctx.fill(this.PATH2D)
        ctx.stroke(this.PATH2D)
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
        this.width = txtWidth + PADDING;
        this.height = TXTHEIGHT + PADDING;

        this.xCenter = (this.x * 2 + this.width) / 2
        this.yCenter = (this.y * 2 + this.height) / 2

        this.PATH2D = new Path2D()

        this.connections = []
        this.resetConnections()

        /**
         * Event Handlers
         */
        document.addEventListener("contextmenu", e => {
            let mouseX = e.clientX - RECT.left, mouseY = e.clientY - RECT.top
            if (ctx.isPointInPath(this.PATH2D, mouseX, mouseY)) {
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
            if (ctx.isPointInPath(this.PATH2D, mouseX, mouseY)) {
                if (this.type == "start" || this.type == "stop") return
                edit = document.createElement("textarea")
                edit.classList.add("edit")
                edit.style.top = this.y + PADDING / 2 - 5 + "px"
                edit.style.left = this.x + "px"
                edit.style.width = this.width - 5 + "px"
                edit.style.height = this.height - PADDING + "px"
                edit.value = this.text
                edit.addEventListener("focusout", e => {
                    this.updateText(!!edit.value ? edit.value : this.text);
                    this.xCenter = (this.x * 2 + this.width) / 2
                    this.connections.forEach(c => c.update())
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
            if (ctx.isPointInPath(this.PATH2D, mouseX, mouseY)) {
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
        let lines = text.split('\n');
        const txtWidth = ctx.measureText(text).width > 50 ? ctx.measureText(text).width : 50
        this.width = txtWidth + PADDING;
        this.height = TXTHEIGHT * lines.length + PADDING;
    }
    resetConnections() {
        this.connections = []
        switch (this.type) {
            case "start":
                this.connections = [
                    new Connection(this.xCenter, this.y + this.height, "output", this)]
                break
            case "stop":
                this.connections = [
                    new Connection(this.xCenter, this.y, "input", this)]
                break
            case "calc":
            case "text":
                this.connections = [
                    new Connection(this.xCenter, this.y + this.height, "output", this),
                    new Connection(this.xCenter, this.y, "input", this)]
                break
            case "logic":
                this.connections = [
                    new Connection(this.xCenter, this.y, "input", this),
                    new Connection(this.x, this.yCenter, "output", this),
                    new Connection(this.x + this.width, this.yCenter, "output", this)]
                break
        }
    }

    draw() {
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        if (this.type == "start" || this.type == "stop")
            this.PATH2D = drawStartStopNode(this.x, this.y, this.type.toUpperCase())
        else
            this.PATH2D = this.TYPES[this.type](this.x, this.y, this.text)
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
let scale = 1


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
    const PATH2D = new Path2D()
    let lines = text.split('\n');
    ctx.font = `${TXTHEIGHT * scale}px serif`
    const txtWidth = ctx.measureText(text).width > 50 * scale ? ctx.measureText(text).width : 50 * scale
    PATH2D.rect(x, y, (txtWidth + PADDING) * scale, (TXTHEIGHT * lines.length + PADDING) * scale)
    ctx.fillStyle = "white"
    ctx.fill(PATH2D)
    ctx.stroke(PATH2D);
    ctx.fillStyle = "black"
    for (let i = 0; i < lines.length; i++)
        ctx.fillText(lines[i], x + ((txtWidth + PADDING) / 2), y + ((TXTHEIGHT + PADDING) / 2 + TXTHEIGHT * i))
    return PATH2D
}

function drawTextNode(x, y, text) {
    const PATH2D = new Path2D()
    const OFFSET = 10
    let lines = text.split('\n');
    ctx.font = `${TXTHEIGHT * scale}px serif`
    const txtWidth = ctx.measureText(text).width > 50 * scale ? ctx.measureText(text).width : 50 * scale
    PATH2D.moveTo((x + OFFSET) * scale, y * scale)
    PATH2D.lineTo((x + OFFSET + txtWidth + PADDING) * scale, y * scale)
    PATH2D.lineTo((x - OFFSET + txtWidth + PADDING) * scale, (y + TXTHEIGHT * lines.length + PADDING) * scale)
    PATH2D.lineTo((x - OFFSET) * scale, (y + TXTHEIGHT * lines.length + PADDING) * scale)
    PATH2D.closePath()
    ctx.fillStyle = "white"
    ctx.fill(PATH2D)
    ctx.stroke(PATH2D);
    ctx.fillStyle = "black"
    for (let i = 0; i < lines.length; i++)
        ctx.fillText(lines[i], x * scale + ((txtWidth + PADDING) * scale / 2), y * scale + ((TXTHEIGHT + PADDING) * scale / 2 + TXTHEIGHT * i))
    return PATH2D
}

function drawLogicNode(x, y, text) {
    const PATH2D = new Path2D()
    let lines = text.split('\n');
    ctx.font = `${TXTHEIGHT * scale}px serif`
    const txtWidth = ctx.measureText(text).width > 50 * scale ? ctx.measureText(text).width : 50 * scale
    PATH2D.moveTo((2 * x + txtWidth + PADDING) * scale / 2, y * scale)
    PATH2D.lineTo((x + txtWidth + PADDING) * scale, (2 * y + TXTHEIGHT * lines.length + PADDING) * scale / 2)
    PATH2D.lineTo((2 * x + txtWidth + PADDING) * scale / 2, (y + TXTHEIGHT * lines.length + PADDING) * scale)
    PATH2D.lineTo(x * scale, (2 * y + TXTHEIGHT * lines.length + PADDING) * scale / 2)
    PATH2D.closePath()
    ctx.fillStyle = "white"
    ctx.fill(PATH2D)
    ctx.stroke(PATH2D);
    ctx.fillStyle = "black"
    for (let i = 0; i < lines.length; i++)
        ctx.fillText(lines[i], x * scale + ((txtWidth + PADDING) * scale / 2), y * scale + ((TXTHEIGHT + PADDING) * scale / 2 + TXTHEIGHT * i))
    ctx.fillText("T", x * scale, y * scale + ((TXTHEIGHT + PADDING) * scale / 2) - 10 * scale)
    ctx.fillText("N", (x + txtWidth + PADDING) * scale, y * scale + ((TXTHEIGHT + PADDING) * scale / 2 - 10 * scale))
    return PATH2D
}

function drawStartStopNode(x, y, text = "START") {
    const PATH2D = new Path2D()
    ctx.font = `${TXTHEIGHT * scale}px serif`
    const txtWidth = ctx.measureText(text).width > 50 * scale ? ctx.measureText(text).width : 50 * scale
    PATH2D.roundRect(x * scale, y * scale, (txtWidth + PADDING) * scale, (TXTHEIGHT + PADDING) * scale, 50)
    ctx.fillStyle = "white"
    ctx.fill(PATH2D)
    ctx.stroke(PATH2D);
    ctx.fillStyle = "black"
    ctx.fillText(text, x * scale + ((txtWidth + PADDING) * scale / 2), y * scale + ((TXTHEIGHT + PADDING) * scale / 2))
    return PATH2D
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