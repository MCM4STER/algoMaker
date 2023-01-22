Array.prototype.fill = function () {
    for (let i = 0; i < this.length; i++)
        this[i] = i + 1
}

const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});
const KAWA = {
    "latte": { "cena": 5 },
    "cappuccino": { "cena": 4 },
    "americano": { "cena": 4 },
    "espresso": { "cena": 3 },
}
const DODATKI = {
    "mleko": { "cena": 1 },
    "cukier": { "cena": 0.5 },
    "mleko+cukier": { "cena": 1.5 },
    "bez dodatkow": { "cena": 0 },
}
function getInput(question) {
    return new Promise((resolve, reject) => {
        rl.question(question, ans => {
            resolve(ans);
        })
    })
}

const main = async () => {
    //Kawa
    let i = 1, q = `Podaj numer kawy:\n`, ans = null;
    for (const [key, value] of Object.entries(KAWA))
        q += `${i++}. ${key} | cena: ${value.cena}zł\n`
    do { console.clear(); ans = await getInput(q) } while (!KAWA[Object.keys(KAWA)[ans - 1]])
    let cena = KAWA[Object.keys(KAWA)[ans - 1]].cena

    //Dodatki
    let i1 = 1, q1 = `Podaj numer dodatku:\n`, ans1 = null;
    for (const [key, value] of Object.entries(DODATKI))
        q1 += `${i1++}. ${key} | cena: ${value.cena}zł\n`
    do { console.clear(); ans1 = await getInput(q1) } while (!DODATKI[Object.keys(DODATKI)[ans1 - 1]])
    cena += DODATKI[Object.keys(DODATKI)[ans1 - 1]].cena

    console.clear()
    console.log("Do zapłaty:", cena, "zł")

    let money = 0
    while (true) {
        money += Number(await getInput(`Wrzuc monety (Podaj wartosc):`))
        if (money > cena) break
        else console.log("brakuje jeszcze:", cena - money, "zł")
    }
    money -= cena
    console.log(`Robienie ${Object.keys(KAWA)[ans - 1]} z ${Object.keys(DODATKI)[ans1 - 1]}`)
    if (money > 0) { console.log("Twoja reszta to:", money, "zł") }
    console.log("Smacznej Kawy!")
    return
}

main();