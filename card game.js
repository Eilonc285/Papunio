let properties = {
    canvasWidth: 1200,
    canvasHeight: 1200,
    backgroundBrightness: 220,
    packsAmount: 1,
    playersAmount: 3,
    cardWidth: 80,
    cardHeight: 120,
    cardCornerCurve: 5,
    handWidth: 600,
    selectedCard: null,
    players: [],
    turn: 0,
    startOfGame: true,
    delayCounter: 0,
    noPlays: false,
    playedThisTurn: false,
    explode: false,
    hasToFinish: false,
    winner: null,
    history: [],
    playFlag: false,
    timerFlag: false,
    timeDelay: 1000,
};

function drawCard(card, x, y) {
    card.x = x;
    card.y = y;
    push();
    if (card.isFacingUp) {
        fill(255, 255, 255, 255);
    } else {
        fill(0, 0, 150, 255);
    }
    if (card == properties.selectedCard) {
        strokeWeight(5);
        stroke(0, 255, 0, 255);
    } else {
        strokeWeight(2);
        stroke(81, 48, 16, 255);
    }
    rect(
        x,
        y,
        properties.cardWidth,
        properties.cardHeight,
        properties.cardCornerCurve
    );
    strokeWeight(1);
    stroke(50, 50, 50, 255);
    if (card.isFacingUp) {
        if (card.type == "Hearts" || card.type == "Diamonds") {
            fill(255, 0, 0, 255);
        } else {
            fill(0, 0, 0, 255);
        }
        let cardValue = "none";
        switch (card.number) {
            case 11:
                cardValue = "J";
                break;
            case 12:
                cardValue = "Q";
                break;
            case 13:
                cardValue = "K";
                break;
            case 14:
                cardValue = "A";
                break;
            default:
                cardValue = card.number;
        }
        textSize(15);
        if (card.isInMiddle) {
            text("" + cardValue, x + 3, y + 5, 80, 120);
            text(card.type, x + 3, y + 20, 80, 120);
        } else {
            text("" + cardValue, x + 3, y + 5, 300, 300);
            text(card.type, x + 3, y + 20, 300, 300);
        }
    }
    pop();
}

let player = {
    drawHand: function drawHand() {
        for (let i = 0; i < this.hand.length; i++) {
            let x =
                (properties.handWidth / this.hand.length) * i +
                (properties.canvasWidth - properties.handWidth) / 2;
            let y = properties.canvasHeight - properties.cardHeight - 20;
            drawCard(this.hand[i], x, y);
        }
    },
    drawTable: function drawTable() {
        for (let i = 0; i < this.table.length; i++) {
            let x =
                (properties.handWidth / 4) * (i % 4) +
                (properties.canvasWidth - properties.handWidth) / 2;
            if (i > 3) {
                x += 10;
            }
            let y = properties.canvasHeight - properties.cardHeight * 2 - 30;
            drawCard(this.table[i], x, y);
        }
    },
};

let table = {
    drawBank: function drawBank() {
        for (let i = 0; i < this.bank.length; i++) {
            let x = properties.canvasWidth / 2 + 100;
            let y = properties.canvasHeight / 2 - i * 3;
            drawCard(this.bank[i], x, y);
        }
    },
    drawCenter: function drawCenter() {
        for (let i = 0; i < this.center.length; i++) {
            let x = 0;
            let y = 0;
            push();
            rectMode(CENTER);
            resetMatrix();
            translate(properties.canvasWidth / 2, properties.canvasHeight / 2);
            rotate(-((PI / 7) * (this.center.length - i - 1)));
            drawCard(this.center[i], x, y);
            pop();
        }
    },
    drawGarbage: function drawGarbage() {
        for (let i = 0; i < this.garbage.length; i++) {
            let x = 0;
            let y = 0;
            push();
            rectMode(CENTER);
            resetMatrix();
            translate(
                properties.canvasWidth / 2 - 200,
                properties.canvasHeight / 2
            );
            rotate((PI / 3) * i);
            drawCard(this.garbage[i], x, y);
            pop();
        }
    },
    bank: [],
    center: [],
    garbage: [],
};

function drawLog() {
    push();
    resetMatrix();
    strokeWeight(2);
    stroke(0, 0, 0, 255);
    fill(0, 0, 0, 255);
    textSize(28);
    text("History Log", 50, properties.canvasHeight - 330, 220, 50);
    strokeWeight(4);
    stroke(200, 100, 0, 255);
    fill(255, 255, 255, 255);
    rectMode(CORNER);
    rect(40, properties.canvasHeight - 300, 220, 250, 15);
    fill(0, 0, 0);
    stroke(0, 0, 0, 255);
    strokeWeight(1);
    textSize(17);
    for (let i = 0; i < 10 && i < properties.history.length; i++) {
        text(
            properties.history[properties.history.length - 1 - i],
            45,
            properties.canvasHeight - 60 - 23 * (i + 1),
            220,
            23
        );
    }
    pop();
}

function shuffleCards(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function explode() {
    properties.history.push("P" + properties.turn + " exploded the center!");
    table.garbage = table.garbage.concat(table.center);
    table.center = [];
    if (properties.turn == 0) {
        properties.hasToFinish = true;
    }
}
function lastThreeCards(card) {
    let len = table.center.length;
    if (len < 4) {
        return false;
    }
    if (
        table.center[len - 2].number == card.number &&
        table.center[len - 3].number == card.number &&
        table.center[len - 4].number == card.number
    ) {
        return true;
    }
    return false;
}

function isPlayableCard(card) {
    const len = table.center.length;
    let lastCard = table.center[len - 1];
    if (!lastCard) {
        lastCard = {};
        lastCard.number = 0;
    }
    if (properties.explode) {
        return false;
    }
    if (
        properties.playedThisTurn &&
        card.number != lastCard.number &&
        lastCard.number != 8
    ) {
        return false;
    }
    if (
        card.number == 10 ||
        card.number == 2 ||
        card.number == 3 ||
        table.center.length == 0 ||
        (lastCard.number == 7 && card.number <= 7) ||
        lastCard.number == 2
    ) {
        return true;
    }
    const limit = len > 3 ? 3 : len;
    for (let i = 0; i < limit; i++) {
        if (table.center[len - 1 - i].number != 3) {
            if (table.center[len - 1 - i].number == 7) {
                return card.number <= 7;
            } else {
                return card.number >= table.center[len - 1 - i].number;
            }
        }
        if (i == len - 1) {
            return true;
        }
    }
    if (table.center[len - 4].number == 7) {
        return card.number <= 7;
    } else {
        return card.number >= table.center[len - 4].number;
    }
}

function removeCard(card) {
    const pl = properties.players[properties.turn];
    if (pl.hand.length > 0) {
        const arr = pl.hand.filter((x) => x != card);
        table.center.push(card);
        pl.hand = arr;
    } else {
        const arr = pl.table.filter((x) => x != card);
        table.center.push(card);
        pl.table = arr;
    }
}

function fillHand() {
    while (
        table.bank.length > 0 &&
        properties.players[properties.turn].hand.length < 4
    ) {
        let card = table.bank.pop();
        if (properties.turn == 0) {
            card.isFacingUp = true;
        }
        properties.players[properties.turn].hand.push(card);
    }
}

function canPlaySecondCard() {
    const p = properties.players[properties.turn];
    for (let i = 0; i < p.hand.length; i++) {
        if (p.hand[i].number == table.center[table.center.length - 1].number) {
            return true;
        }
    }
    if (p.hand.length == 0) {
        for (let i = p.table.length > 4 ? 4 : 0; i < p.table.length; i++) {
            if (
                p.table[i].number ==
                table.center[table.center.length - 1].number
            ) {
                return true;
            }
        }
    }
    return false;
}

function playCard(card) {
    properties.history.push(
        "P" +
            properties.turn +
            " played " +
            fixedCardNumber(card) +
            " of " +
            card.type
    );
    card.isInMiddle = true;
    properties.playedThisTurn = true;
    removeCard(card);
    card.isFacingUp = true;
    switch (card.number) {
        case 10:
            properties.explode = true;
            if (properties.turn != 0) {
                endTurn();
            }
            break;
        case 8:
            if (lastThreeCards(card)) {
                properties.explode = true;
                if (properties.turn != 0) {
                    endTurn();
                }
            } else {
                if (
                    properties.turn != 0 &&
                    canPlaySecondCard() &&
                    Math.random() >= 0.5
                ) {
                    endTurn();
                }
            }
            break;
        default:
            if (lastThreeCards(card)) {
                properties.explode = true;
                if (properties.turn != 0) {
                    endTurn();
                }
            } else {
                if (
                    properties.turn != 0 &&
                    canPlaySecondCard() &&
                    Math.random() >= 0.5
                ) {
                    endTurn();
                }
            }
            break;
    }
}

function endTurn() {
    fillHand();
    properties.playedThisTurn = false;
    if (properties.explode) {
        properties.explode = false;
        explode();
    }
    properties.hasToFinish = false;
    properties.turn = (properties.turn + 1) % properties.playersAmount;
}

function takeCenter() {
    properties.history.push("P" + properties.turn + " took the center!");
    for (let i = 0; i < table.center.length; i++) {
        table.center[i].isInMiddle = false;
        if (properties.turn != 0) {
            table.center[i].isFacingUp = false;
        }
    }
    const arr = properties.players[properties.turn].hand.concat(table.center);
    table.center = [];
    properties.players[properties.turn].hand = arr;
    if (properties.turn == 0) {
        properties.hasToFinish = true;
    }
}
let myCount = 0;
function mousePressed() {
    if (myCount < 10) {
        return;
    } else {
        myCount = 0;
    }
    let select = null;
    if (properties.turn == 0) {
        if (
            // end turn button
            properties.canvasWidth - 200 < mouseX &&
            mouseX < properties.canvasWidth - 50 &&
            properties.canvasHeight - 150 < mouseY &&
            mouseY < properties.canvasHeight - 50 &&
            (properties.playedThisTurn || properties.hasToFinish)
        ) {
            endTurn();
        }
        if (
            // play button
            properties.canvasWidth - 200 < mouseX &&
            mouseX < properties.canvasWidth - 50 &&
            properties.canvasHeight - 250 < mouseY &&
            mouseY < properties.canvasHeight - 150 &&
            !properties.hasToFinish
        ) {
            if (properties.players[0].hand.length > 0) {
                for (let i = 0; i < properties.players[0].hand.length; i++) {
                    if (
                        properties.players[0].hand[i] ==
                            properties.selectedCard &&
                        isPlayableCard(properties.players[0].hand[i])
                    ) {
                        playCard(properties.players[0].hand[i]);
                    }
                }
            } else {
                if (properties.players[0].table.length > 4) {
                    for (
                        let i = 0;
                        i < properties.players[0].table.length;
                        i++
                    ) {
                        if (
                            properties.players[0].table[i] ==
                                properties.selectedCard &&
                            properties.selectedCard.isFacingUp &&
                            isPlayableCard(properties.selectedCard)
                        ) {
                            playCard(properties.selectedCard);
                            if (properties.players[0].table.length < 5) {
                                properties.hasToFinish = true;
                            }
                        }
                    }
                } else {
                    for (
                        let i = 0;
                        i < properties.players[0].table.length;
                        i++
                    ) {
                        if (
                            properties.players[0].table[i] ==
                            properties.selectedCard
                        ) {
                            if (isPlayableCard(properties.selectedCard)) {
                                playCard(properties.selectedCard);
                                properties.hasToFinish = true;
                            } else {
                                playCard(properties.selectedCard);
                                takeCenter();
                            }
                        }
                    }
                }
            }
        }
    }
    if (
        // pass turn after 8
        150 < mouseX &&
        mouseX < 200 &&
        properties.canvasHeight - 150 < mouseY &&
        mouseY < properties.canvasHeight - 100
    ) {
        properties.passable = false;
        properties.turn = (properties.turn + 1) % 4;
    }
    if (
        // takeCenter when no plays available
        properties.canvasWidth / 2 - 60 < mouseX &&
        mouseX < properties.canvasWidth / 2 + 60 &&
        properties.canvasHeight - 350 < mouseY &&
        mouseY < properties.canvasHeight - 300 &&
        properties.turn == 0 &&
        properties.noPlays &&
        !properties.playedThisTurn &&
        !(
            properties.players[0].hand.length == 0 &&
            properties.players[0].table.length < 5
        )
    ) {
        properties.noPlays = false;
        takeCenter();
    }
    if (properties.players[0].hand.length > 0) {
        for (let i = 0; i < properties.players[0].hand.length; i++) {
            let card = properties.players[0].hand[i];
            if (
                card.x < mouseX &&
                mouseX < card.x + properties.cardWidth &&
                card.y < mouseY &&
                mouseY < card.y + properties.cardHeight
            ) {
                select = card;
            }
        }
        properties.selectedCard = select;
        if (select) {
            if (
                properties.players[0].table.length < 8 &&
                properties.startOfGame
            ) {
                let arr = properties.players[0].hand.filter(
                    (x) => x != properties.selectedCard
                );
                properties.players[0].table.push(properties.selectedCard);
                properties.players[0].hand = arr;
                if (properties.players[0].table.length == 8) {
                    properties.startOfGame = false;
                }
            }
        }
    } else {
        for (let i = 0; i < properties.players[0].table.length; i++) {
            let card = properties.players[0].table[i];
            if (
                card.x < mouseX &&
                mouseX < card.x + properties.cardWidth &&
                card.y < mouseY &&
                mouseY < card.y + properties.cardHeight
            ) {
                if (properties.players[0].table.length < 5) {
                    select = card;
                } else {
                    if (card.isFacingUp) {
                        select = card;
                    }
                }
            }
        }
        properties.selectedCard = select;
    }
}

function getPlayableCard() {
    let p = properties.players[properties.turn];
    for (let i = 0; i < p.hand.length; i++) {
        if (isPlayableCard(p.hand[i])) {
            return p.hand[i];
        }
    }
    if (p.hand.length == 0) {
        for (let i = p.table.length > 4 ? 4 : 0; i < p.table.length; i++) {
            if (isPlayableCard(p.table[i])) {
                return p.table[i];
            }
        }
    }
    return null;
}

function checkWinner() {
    if (properties.winner === null) {
        for (let i = 0; i < properties.playersAmount; i++) {
            if (
                properties.players[i].hand.length == 0 &&
                properties.players[i].table.length == 0
            ) {
                properties.winner = i;
            }
        }
    }
}

function fixedCardNumber(card) {
    let cardNum;
    switch (card.number) {
        case 11:
            cardNum = "Jack";
            break;
        case 12:
            cardNum = "Queen";
            break;
        case 13:
            cardNum = "King";
            break;
        case 14:
            cardNum = "Ace";
            break;
        default:
            cardNum = card.number;
            break;
    }
    return cardNum;
}

function setup() {
    createCanvas(properties.canvasWidth, properties.canvasHeight);
    for (let i = 0; i < 4 * properties.packsAmount; i++) {
        for (let j = 2; j <= 14; j++) {
            let types = ["Hearts", "Diamonds", "Clubs", "Spades"];
            table.bank.push({
                type: types[i % 4],
                isFacingUp: false,
                number: j,
                x: 0,
                y: 0,
            });
        }
    }
    table.bank = shuffleCards(table.bank);
    for (let i = 0; i < 4; i++) {
        const p = Object.create(player);
        p.table = [];
        p.hand = [];
        properties.players.push(p);
    }
    let opponents = parseInt(
        window.prompt("Enter a number of computer opponents between 1 and 3: "),
        10
    );
    if (isNaN(opponents) || opponents < 1 || 3 < opponents) {
        properties.history.push("Error: default to 3");
        properties.history.push("opponents");
        properties.playersAmount = 4;
    } else {
        properties.playersAmount = opponents + 1;
    }
    for (let i = 0; i < properties.playersAmount; i++) {
        for (let j = 0; j < 12; j++) {
            let card = table.bank.pop();
            card.isInMiddle = false;
            if (i > 0) {
                if (j <= 3) {
                    properties.players[i].table.push(card);
                }
                if (j > 3 && j < 8) {
                    card.isFacingUp = true;
                    properties.players[i].table.push(card);
                }
                if (j >= 8) {
                    card.isFacingUp = false;
                    properties.players[i].hand.push(card);
                }
            } else {
                if (j > 3) {
                    card.isFacingUp = true;
                    properties.players[i].hand.push(card);
                } else {
                    properties.players[i].table.push(card);
                }
            }
        }
    }
}

function draw() {
    background(properties.backgroundBrightness);
    checkWinner();
    if (properties.turn == 0) {
        let c = getPlayableCard();
        if (
            !c &&
            !properties.playedThisTurn &&
            !(
                properties.players[0].hand.length == 0 &&
                properties.players[0].table.length < 5
            )
        ) {
            properties.noPlays = true;
            push();
            resetMatrix();
            strokeWeight(4);
            stroke(255, 0, 0, 255);
            fill(255, 255, 255);
            rect(
                properties.canvasWidth / 2 - 60,
                properties.canvasHeight - 350,
                120,
                50,
                15
            );
            stroke(0, 0, 0, 255);
            strokeWeight(1);
            fill(0, 0, 0);
            textSize(18);
            text(
                "Take center",
                properties.canvasWidth / 2 - 47,
                properties.canvasHeight - 333,
                120,
                45
            );
            pop();
        }
    }
    if (!properties.timerFlag && properties.turn != 0) {
        properties.timerFlag = true;
        setTimeout(() => {
            properties.playFlag = true;
            properties.timerFlag = false;
        }, properties.timeDelay);
    }
    if (properties.turn != 0 && properties.playFlag) {
        properties.playFlag = false;
        if (properties.playedThisTurn) {
            if (canPlaySecondCard()) {
                let c = getPlayableCard();
                if (c) {
                    playCard(c);
                } else {
                    takeCenter();
                    endTurn();
                }
            } else {
                endTurn();
            }
        } else {
            let c = getPlayableCard();
            if (c) {
                playCard(c);
            } else {
                takeCenter();
                endTurn();
            }
        }
        properties.delayCounter = 0;
    }
    table.drawBank();
    table.drawCenter();
    table.drawGarbage();
    push();
    for (let i = 0; i < properties.players.length; i++) {
        if (i == 1) {
            rotate(PI / 2);
            translate(0, -properties.canvasHeight);
        }
        if (i == 2) {
            rotate(PI);
            translate(-properties.canvasWidth, -properties.canvasHeight);
        }
        if (i == 3) {
            rotate(-PI / 2);
            translate(-properties.canvasWidth, 0);
        }
        properties.players[i].drawTable();
        properties.players[i].drawHand();
    }
    pop();
    if (properties.turn == 0) {
        push();
        strokeWeight(4);
        stroke(0);
        fill(0, 255, 0);
        rect(
            properties.canvasWidth - 200,
            properties.canvasHeight - 250,
            150,
            100,
            15
        );
        rect(
            properties.canvasWidth - 200,
            properties.canvasHeight - 130,
            150,
            100,
            15
        );
        noStroke();
        fill(0, 0, 0);
        textSize(35);
        text(
            "Play",
            properties.canvasWidth - 157,
            properties.canvasHeight - 215,
            45,
            45
        );
        text(
            "End turn",
            properties.canvasWidth - 157,
            properties.canvasHeight - 115,
            45,
            80
        );
        pop();
    }
    if (properties.winner !== null) {
        push();
        resetMatrix();
        rectMode(CORNER);
        textSize(120);
        fill(0, 220, 0, 200);
        text(
            "Player " + properties.winner + " Won!",
            properties.canvasWidth / 5,
            properties.canvasHeight / 4,
            (properties.canvasWidth * 2) / 3,
            (properties.canvasHeight * 1) / 4
        );
        pop();
    }
    drawLog();
    myCount++;
    properties.delayCounter++;
}
