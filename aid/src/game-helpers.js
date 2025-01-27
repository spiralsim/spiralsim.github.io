class Entity {
    constructor(x, y, w, h) {
        this.pos = createVector(x, y);
        this.w = w;
        this.h = h;
        this.r = new Rect(x, y, w, h);
        this.center = createVector(this.pos.x + this.w / 2, this.pos.y + this.h / 2);
        this.deleteMe = false;
    }

    checkCollision({ pos: { x: x, y: y }, w: w, h: h }) {
        return !(this.pos.x + this.w <= x || this.pos.x >= x + w || this.pos.y + this.h <= y || this.pos.y >= y + h);
    }

    // Push back the player so that it is no longer intersecting this entity
    pushPlayer() {
        if (player.vel.x < 0 && player.pos.x + player.w > this.pos.x + this.w) {
            player.vel.x = 0;
            player.pos.x = this.pos.x + this.w;
        }
        if (player.vel.x > 0 && player.pos.x < this.pos.x) {
            player.vel.x = 0;
            player.pos.x = this.pos.x - player.w;
        }
        if (player.vel.y > 0 && player.pos.y < this.pos.y && player.jumping) {
            player.vel.y = 0;
            player.jumping = false;
            player.pos.y = this.pos.y - player.h;
        }
        if (player.vel.y < 0 && player.pos.y + player.h > this.pos.y + this.h) {
            player.vel.y = 0;
            player.jumping = true;
            player.pos.y = this.pos.y + this.h;
        }
    }

    draw() {}
    onCollision() {}
    update() {}

    run() {
        this.update();
        this.draw();
        if (this.checkCollision(player)) this.onCollision();
    }
}

function drawCaptainZero(x, y = INTRINSIC_H / 2) {
    imageMode(CENTER);
    image(images.characters[0], x, y, PLAYER_W, PLAYER_H);
}
function drawInfinitus(x, y = INTRINSIC_H / 2) {
    imageMode(CENTER);
    image(images.characters[1], x, y, INFINITUS_W, INFINITUS_H);
}

class Player extends Entity {
    constructor() {
        super(0, 0, PLAYER_W, PLAYER_H);
        this.spawnPos = spawnPos.copy();
        this.spawnPos.x += (CELL_SIZE - this.w) / 2;
        this.pos = this.spawnPos.copy();
        this.prevPos = this.spawnPos.copy();
        this.vel = createVector();
        this.jumping = false;
        entities.forEach(e => {
            if (e instanceof Cannon) e.bullets = [];
        });
    }

    draw() {
        image(images.characters[0], this.pos.x, this.pos.y, this.w, this.h);
    }
    update() {
        this.move();
    }
    move() {
        this.prevPos = this.pos.copy();
        this.pos.add(this.vel);
        // If the player is directly on top of a block, they are not jumping
        entities.forEach(e => {
            if ((e instanceof Block || e instanceof Cannon) && this.pos.x + this.w > e.pos.x && this.pos.x < e.pos.x + e.w && this.pos.y + this.h == e.pos.y) this.jumping = false;
        });
    }
    freeze() {
        this.vel = createVector();
    }
}
class Block extends Entity {
    selected = false;

    constructor(x, y, w, h, userMade) {
        super(x, y, w, h);
        this.userMade = userMade;
    }

    toggle() {
        this.selected = !this.selected;
        if (this.selected) selectedBlocks.add(this);
        else selectedBlocks.delete(this);
    }
    draw() {
        fill(...LEVELS_DATA[curLevel - 1].blockCol);
        if (this.selected) fill(128 * (1 + sin(frameCount / 10)), 128 * (1 + sin(frameCount / 10)), 255);
        noStroke();
        rect(this.pos.x, this.pos.y, this.w, this.h);
        if (this.userMade) {
            stroke(192);
            strokeWeight(1);
            for (let x = this.pos.x; x <= this.pos.x + this.w; x += 15) line(x, this.pos.y, x, this.pos.y + this.h);
            for (let y = this.pos.y; y <= this.pos.y + this.h; y += 15) line(this.pos.x, y, this.pos.x + this.w, y);
        }
        if (hasMachine && this.r.isHovered) {
            cursor(HAND);
            if (mouseIsReleased) this.toggle();
        }
    }
    onCollision() {
        this.pushPlayer();
    }
}
class Spawn extends Entity {
    constructor(x, y) {
        super(x, y, CELL_SIZE, CELL_SIZE);
        spawnPos = this.pos;
    }

    draw() {
        fill(255, 0, 255);
        noStroke();
        rect(this.pos.x, this.pos.y, this.w, this.h);
    }
}
class Finish extends Entity {
    isUsed = false;

    constructor(x, y, w, h) {
        super(x, y, w, h);
    }

    draw() {
        fill(0, 255, 255);
        noStroke();
        rect(this.pos.x, this.pos.y, this.w, this.h);
    }
    onCollision() {
        if (curLevel < LEVELS_DATA.length) SceneManager.fadeToScene(Game, curLevel + 1);
        else SceneManager.fadeToScene(End);
    }
}
class Lava extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h);
    }

    draw() {
        fill(192 + 64 * sin(frameCount / 10), 0, 0);
        noStroke();
        rect(this.pos.x, this.pos.y, this.w, this.h);
    }
    onCollision() {
        resetLevel();
    }
}
class Trampoline extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h);
    }

    draw() {
        fill(0, 255, 0);
        noStroke();
        rect(this.pos.x, this.pos.y, this.w, this.h);
    }
    onCollision() {
        if (player.vel.y > 0) player.vel.y = max(player.vel.y * -1.2, -9);
        player.jumping = true;
        this.pushPlayer();
    }
}
class Text extends Entity {
    static TEXT_WIDTH = INTRINSIC_W * 9 / 16;

    constructor(txt, x, y) {
        super(x, y, Text.TEXT_WIDTH, 15);
        textSize(15);
        this.txt = txt;
    }

    draw() {
        fill.apply(null, LEVELS_DATA[curLevel - 1].textCol);
        textSize(15);
        textAlign(CENTER, TOP);
        stroke(0);
        strokeWeight(2);
        text(this.txt, this.pos.x - Text.TEXT_WIDTH / 2, this.pos.y, Text.TEXT_WIDTH);
    }
}
class Cannon extends Entity {
    constructor(x, y) {
        super(x, y, CELL_SIZE, CELL_SIZE);
        this.bullets = [];
        this.pointing = createVector(1, 0);
        this.inRange = false;
        this.reload = 0;
    }

    draw() {
        noStroke();
        fill(this.inRange ? color(255, 255, this.reload / RELOAD_TIME * 255) : 192);
        rect(this.pos.x, this.pos.y, this.w, this.h);
        push();
        translate(this.center.x, this.center.y);
        rotate(atan2(this.pointing.y, this.pointing.x));
        imageMode(CENTER);
        image(images.entities[1], 0, 0, this.w, this.h);
        imageMode(CORNER);
        pop();
        this.bullets.forEach(b => {
            fill(0);
            stroke(255);
            strokeWeight(1);
            ellipse(b.pos.x, b.pos.y, 6, 6);
        });
    }
    update() {
        // Random seeding makes cannons fire in staggered intervals
        if (this.pos.dist(player.pos) < CELL_SIZE * 20) {
            if (random() < 0.05) this.inRange = true;
        } else this.inRange = false;
        if (this.inRange) {
            this.pointing = player.pos.copy().sub(this.center).normalize().mult(2);
            if (!this.reload) {
                this.bullets.push({
                    pos: this.center.copy(),
                    vel: this.pointing.copy(),
                    w: 6,
                    h: 6,
                    age: 0
                });
                this.reload = RELOAD_TIME;
            } else this.reload--;
        }
        this.bullets.forEach(b => {
            b.pos.add(b.vel);
            b.vel.add(p5.Vector.random2D().div(100));
            if (player.checkCollision(b)) resetLevel();
            entities.forEach(e => {
                if (e instanceof Block && e.checkCollision(b)) b.deleteMe = true;
                if (e instanceof Trampoline && e.checkCollision(b)) {
                    if (b.pos.y > e.pos.y && b.pos.y + b.h < e.pos.y + e.h) b.vel.x = constrain(b.vel.x * -1.5, -10, 10); // Vertical bounce
                    if (b.pos.x > e.pos.x && b.pos.x + b.w < e.pos.x + e.w) b.vel.y = constrain(b.vel.y * -1.5, -10, 10); // Horizontal bounce
                }
            });
            if (b.age++ > 1800) b.deleteMe = true;
            if (b.pos.x < 0 || b.pos.x > INTRINSIC_W || b.pos.y < 0 || b.pos.y > INTRINSIC_H) b.deleteMe = true;
        });
        this.bullets = this.bullets.filter(b => !b.deleteMe);
    }
    onCollision() {
        this.pushPlayer();
    }
}

class Item extends Entity {
    isCollected = false;

    constructor(x, y, name) {
        super(x, y, CELL_SIZE, CELL_SIZE);
        this.name = name;
    }

    onCollision() {
        if (this.isCollected) return;
        // Fills first empty inventory slot with a copy of this item
        const slot = inventory.find(b => !b.item);
        this.pos = createVector(slot.r.x, slot.r.y);
        slot.setItem(this);
        this.isCollected = true;
    }
}
class Numeral extends Item {
    draw(pos = this.pos) {
        textFont(ITEM_FONT_NAME);
        colorMode(HSB);
        if (parseInt(this.name)) fill(360 * (parseInt(this.name) / 10), 100, 80);
        else fill(255);
        textSize(CELL_SIZE * 2 / 3);
        textAlign(CENTER, CENTER);
        stroke(255);
        strokeWeight(1);
        text(this.name, pos.x + this.w / 2, pos.y + this.h / 2);
        colorMode(RGB);
        textFont(MAIN_FONT_NAME);
    }
}
class Operator extends Item {
    draw(pos = this.pos) {
        textFont(ITEM_FONT_NAME);
        fill(64);
        textSize(CELL_SIZE * 2 / 3);
        textAlign(CENTER, CENTER);
        stroke(255);
        strokeWeight(1);
        text(this.name, pos.x + this.w / 2, pos.y + this.h / 2);
        textFont(MAIN_FONT_NAME);
    }
}
class Machine extends Item {
    draw(pos = this.pos) {
        strokeWeight(1);
        push();
        translate(pos.x + this.w / 2, pos.y + this.h / 2);
        noFill();
        stroke(0, 0, 255, 128);
        for (let i = 0; i < 6; i++) {
            rotate(PI / 6);
            ellipse(0, 0, this.w * sin(frameCount / 10 + i), this.h / 2 * sin(frameCount / 10 + i));
        }
        fill(255, 128);
        stroke(0);
        rectMode(CENTER);
        rotate(frameCount / 20);
        rect(0, 0, this.w * 2 / 3, this.h * 2 / 3);
        rotate(-frameCount / 10);
        rect(0, 0, this.w * 2 / 3, this.h * 2 / 3);
        // Equals sign
        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        rect(0, -this.h / 12, this.w * 1 / 3, this.h / 12);
        rect(0, this.h / 12, this.w * 1 / 3, this.h / 12);
        rectMode(CORNER);
        pop();
    }
    onCollision() {
        hasMachine = true;
        showingManual = true;
        this.deleteMe = true;
    }
}

function drawScaleRing(exponent, d = INTRINSIC_H * 0.8, alpha = 64) {
    stroke(255, alpha);
    noFill();
    strokeWeight(d / 20);
    arc(INTRINSIC_W / 2, INTRINSIC_H / 2, d, d, PI * -1 / 3, PI * 4 / 3);
    fill(255, alpha);
    noStroke();
    textSize(d / 8);
    const szText = '10' + (exponent + '').split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[parseInt(c)]).join('');
    text((exponent == '∞' ? '∞' : szText) + ' m', INTRINSIC_W / 2, INTRINSIC_H / 2 - d / 2);
}
