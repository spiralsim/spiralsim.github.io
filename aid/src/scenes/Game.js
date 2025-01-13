function Game() {

    function Entity (x, y, w, h) {
        this.pos = createVector(x, y);
        this.w = w;
        this.h = h;
        this.center = createVector(this.pos.x + this.w / 2, this.pos.y + this.h / 2);
        this.deleteMe = false;

        this.draw = this.onCollision = this.update = () => {};
        this.checkCollision = function ({
            pos: {x: x, y: y},
            w: w,
            h: h
        }) {
            return !(this.pos.x + this.w <= x || this.pos.x >= x + w || this.pos.y + this.h <= y || this.pos.y >= y + h);
        };
        // Push back the player so that it is no longer intersecting this entity
        this.pushPlayer = function () {
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
        };
        this.run = function () {
            this.update();
            this.draw();
            if (this.checkCollision(player)) this.onCollision();
        };
    }
    function Player () {
        Entity.call(this, 0, 0, playerSize * images.CAPTAIN_ZERO_RATIO, playerSize);
        this.spawnPos = spawnPos.copy();
        this.spawnPos.x += (tileSize - this.w) / 2;

        this.draw = function () {
            image(images.characters[0], this.pos.x, this.pos.y, this.w, this.h);
        };
        this.update = function () {
            this.move();
        };
        this.move = function () {
            this.prevPos = this.pos.copy();
            this.pos.add(this.vel);
            // If the player is directly on top of a block, they are not jumping
            entities.forEach(e => {
                if ((e instanceof Block || e instanceof Cannon) && this.pos.x + this.w > e.pos.x && this.pos.x < e.pos.x + e.w && this.pos.y + this.h == e.pos.y) this.jumping = false;
            });
        };
        this.freeze = function () {
            this.vel = createVector();
        };
        this.spawn = function () {
            this.pos = this.spawnPos.copy();
            this.prevPos = this.spawnPos.copy();
            this.vel = createVector();
            this.jumping = false;
            entities.forEach(e => {
                if (e instanceof Cannon) e.bullets = [];
            });
        };

        this.spawn();
    }
    function Block (x, y, w, h, userMade) {
        Entity.call(this, x, y, w, h);
        this.selected = false;
        this.userMade = userMade;
        
        this.draw = function () {
            fill.apply(null, LEVELS[level - 1].blockCol);
            if (this.selected) fill(128 * (1 + sin(frameCount / 10)), 128 * (1 + sin(frameCount / 10)), 255);
            noStroke();
            rect(this.pos.x, this.pos.y, this.w, this.h);
            if (this.userMade) {
                stroke(192);
                strokeWeight(1);
                for (let x = this.pos.x; x <= this.pos.x + this.w; x += 15) line(x, this.pos.y, x, this.pos.y + this.h);
                for (let y = this.pos.y; y <= this.pos.y + this.h; y += 15) line(this.pos.x, y, this.pos.x + this.w, y);
            }
        };
        this.onCollision = function () {
            this.pushPlayer();
        };
    }
    function Spawn (x, y) {
        Entity.call(this, x, y, tileSize, tileSize);
        spawnPos = this.pos;
        
        this.draw = function () {
            fill(255, 0, 255);
            noStroke();
            rect(this.pos.x, this.pos.y, this.w, this.h);
        };
    }
    function Finish (x, y, w, h) {
        Entity.call(this, x, y, w, h);
        
        this.draw = function () {
            fill(0, 255, 255);
            noStroke();
            rect(this.pos.x, this.pos.y, this.w, this.h);
        };
        this.onCollision = function () {
            nextLevel = true;
        };
    }
    function Lava (x, y, w, h) {
        Entity.call(this, x, y, w, h);
        
        this.draw = function () {
            fill(192 + 64 * sin(frameCount / 10), 0, 0);
            noStroke();
            rect(this.pos.x, this.pos.y, this.w, this.h);
        };
        this.onCollision = function () {
            player.spawn();
        };
    }
    function Trampoline (x, y, w, h) {
        Entity.call(this, x, y, w, h);
        
        this.draw = function () {
            fill(0, 255, 0);
            noStroke();
            rect(this.pos.x, this.pos.y, this.w, this.h);
        };
        this.onCollision = function () {
            if (player.vel.y > 0) player.vel.y = max(player.vel.y * -1.2, -9);
            player.jumping = true;
            this.pushPlayer();
        };
    }
    function Text (txt, x, y, w) {
        textSize(15);
        Entity.call(this, x, y, w || textWidth(txt), 15);
        this.txt = txt;
        this.textW = w;
        
        this.draw = function () {
            fill.apply(null, LEVELS[level - 1].textCol);
            textSize(15);
            textAlign(CENTER, TOP);
            text(this.txt, this.pos.x - (this.textW ? this.w / 2 : 0), this.pos.y, this.textW);
        };
    }
    const fillNull = (arr, val) => {
        arr[arr.indexOf(null)] = val;
    };
    function drawNumber (name, pos, w, h, defColor) {
        fill(255, 192);
        noStroke();
        circle(pos.x + w / 2, pos.y + h / 2, w);
        colorMode(HSB);
        if (parseInt(name)) fill(360 * (parseInt(name) / 10), 100, 100);
        else fill(defColor);
        textSize(w);
        textAlign(CENTER, CENTER);
        noStroke();
        text(name, pos.x + w / 2, pos.y + h / 2);
        colorMode(RGB);
    }
    function _Number (x, y, name) {
        Entity.call(this, x, y, tileSize, tileSize);
        this.name = name;
        
        this.draw = function () {
            drawNumber(this.name, this.pos, this.w, this.h, 255);
        };
        this.onCollision = function () {
            fillNull(numbers, this.name);
            alreadyFound.push([this.pos, level]);
            this.deleteMe = true;
        };
    }
    function drawOperator (name, pos, w, h) {
        fill(255, 192);
        noStroke();
        circle(pos.x + w / 2, pos.y + h / 2, w);
        fill(64);
        textSize(w);
        textAlign(CENTER, CENTER);
        noStroke();
        text(name, pos.x + w / 2, pos.y + h / 2);
    }
    function Operator (x, y, name) {
        Entity.call(this, x, y, tileSize, tileSize);
        this.name = name;
        
        this.draw = function () {
            drawOperator(this.name, this.pos, this.w, this.h);
        };
        this.onCollision = function () {
            fillNull(operators, this.name);
            alreadyFound.push([this.pos, level]);
            this.deleteMe = true;
        };
    }
    function drawMachine (pos, w, h) {
        strokeWeight(1);
        push();
        translate(pos.x + w / 2, pos.y + h / 2);
        noFill();
        stroke(0, 0, 255, 128);
        for (let i = 0; i < 6; i++) {
            rotate(PI / 6);
            ellipse(0, 0, w * sin(frameCount / 10 + i), h / 2 * sin(frameCount / 10 + i))
        }
        fill(255, 128);
        stroke(0);
        rectMode(CENTER);
        rotate(frameCount / 20);
        rect(0, 0, w * 2/3, h * 2/3);
        rotate(-frameCount / 10);
        rect(0, 0, w * 2/3, h * 2/3);
        // Equals sign
        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        rect(0, -h / 12, w * 1/3, h / 12);
        rect(0, h / 12, w * 1/3, h / 12);
        rectMode(CORNER);
        pop();
    }
    function Machine (x, y) {
        Entity.call(this, x, y, tileSize, tileSize);
        
        this.draw = function () {
            drawMachine(this.pos, this.w, this.h)
        };
        this.onCollision = function () {
            hasMachine = true;
            alreadyFound.push([this.pos, level]);
            showExplanation = true;
            toolbarImg = get(720, 0, 240, 960);
            this.deleteMe = true;
        };
    }
    function Cannon (x, y) {
        Entity.call(this, x, y, tileSize, tileSize);
        this.bullets = [];
        this.pointing = createVector(1, 0);
        this.inRange = false;
        this.reload = 0;
        
        this.draw = function () {
            noStroke();
            fill(this.inRange ? color(255, 255, this.reload / reloadTime * 255) : 192);
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
        };
        this.update = function () {
            // Random seeding makes cannons fire in staggered intervals
            if (this.pos.dist(player.pos) < tileSize * 20) {
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
                    this.reload = reloadTime;
                } else this.reload--;
            }
            this.bullets.forEach(b => {
                b.pos.add(b.vel);
                b.vel.add(p5.Vector.random2D().div(100));
                if (player.checkCollision(b)) player.spawn();
                entities.forEach(e => {
                    if (e instanceof Block && e.checkCollision(b)) b.deleteMe = true;
                    if (e instanceof Trampoline && e.checkCollision(b)) {
                        if (b.pos.y > e.pos.y && b.pos.y + b.h < e.pos.y + e.h) b.vel.x = constrain(b.vel.x * -1.5, -10, 10); // Vertical bounce
                        if (b.pos.x > e.pos.x && b.pos.x + b.w < e.pos.x + e.w) b.vel.y = constrain(b.vel.y * -1.5, -10, 10); // Horizontal bounce
                    }
                });
                if (b.age++ > 1800) b.deleteMe = true;
                if (b.pos.x < 0 || b.pos.x > 720 || b.pos.y < 0 || b.pos.y > 720) b.deleteMe = true;
            });
            this.bullets = this.bullets.filter(b => !b.deleteMe);
        };
        this.onCollision = function () {
            this.pushPlayer();
        };
    }
    function generateLevel () {
        entities = [];
        LEVELS[level - 1].entities.forEach(entity => {
            const newEntity = eval(`new ${entity[0]}(${JSON.stringify(entity.slice(1)).replace(/\[|\]/g, '')})`);
            // If the entity is a number or operator, make sure it has not already been picked up in the current game
            var alreadyPickedUp = false;
            if (["_Number", "Operator", "Machine"].indexOf(entity[0]) > -1) {
                alreadyFound.forEach(e => {
                    if (newEntity.pos.equals(e[0]) && level == e[1]) alreadyPickedUp = true;
                });
            }
            if (!alreadyPickedUp) entities.push(newEntity);
        });
        (userMadeBlocks[level - 1] || []).forEach(block => {
            entities.push(new Block(block.pos.x, block.pos.y, block.w, block.h, true));
        });
        player = new Player();
        entities.push(player);
        playerScale = level;
    }
    function scaleRing (x, y, sz, _scale) {
        stroke(255, 64);
        noFill();
        strokeWeight(sz / 20);
        arc(x, y, sz, sz, PI * -1/3, PI * 4/3);
        fill(255, 64);
        noStroke();
        textSize(sz / 8);
        const szText = '10' + (_scale + '').split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[parseInt(c)]).join('');
        text((_scale == '∞' ? '∞' : szText) + ' m', x, y - sz / 2);
    }

    // General transitions
    var loaded = false, page, fadeIn = 0, fadeTo = "Home", clicking = false; // If fadeTo != page and fadeTo is not null, the program will make a fade transition to fadeTo
    // Game
    var level = 0, nextLevel = true;
    var tileSize = 30, playerSize = tileSize * 0.8, reloadTime = 60, entities = [], player;
    var numbers = Array(10).fill(null), operators = Array(10).fill(null), hasMachine = false, alreadyFound = [] /* stores a list of arrays of coordinates and levels of numbers/operators that have already been picked up in this game */, expression = "", evalCol = 255, errMsg = "";
    var showExplanation = false, filling = false, okMsg = "", fillSize, selBlocks = [], userMadeBlocks = [... Array(10)].map(a => []);
    var spawnPos, playerScale = 1; 
    if (false) { //devmode
        page = "Game";
        fadeTo = null;
        level = 5;
        hasMachine = true;
    }
    // End scene
    var ringX = 360, CZy, gameFade = 255, toolbarImg, infinitusFade = 0, fightPos = 240, explosionSize = 0, finishedAnim = false, endFade = 0;
    this.draw = function() {
        if (nextLevel) {
            level++;
            if (level > LEVELS.length) {
                CZy = player.pos.y + player.h / 2;
                page = "End";
            } else {
                generateLevel();
                nextLevel = false;
            }
        }

        // Player physics
        if (keyIsDown(LEFT_ARROW)) player.vel.x = -2;
        else if (keyIsDown(RIGHT_ARROW)) player.vel.x = 2;
        else player.vel.x *= 0.5;
        if (abs(player.vel.x) < 0.1) player.vel.x = 0;
        if (keyIsDown(UP_ARROW) && !player.jumping) {
            player.vel.y = -5;
            player.jumping = true;
        }
        if (player.jumping) player.vel.y += 0.15;
        player.jumping = true; // By default, assume the player is in the air and should be accelerated by gravity
        if (player.pos.x < 0 || player.pos.x > 720 || player.pos.y > 720) {
            // level--;
            generateLevel();
        }

        // Game drawing
        image(images.backgrounds[level - 1], 0, 0, 720, 720);
        scaleRing(360, 360, 600, playerScale);
        entities.forEach(e => e.run());
        entities = entities.filter(e => !e.deleteMe);
        if (showExplanation) {
            fill(255, 128);
            rect(0, 0, 720, 720);
            fill(192);
            rect(120, 120, 480, 480, 20);
            fill(0);
            textSize(30);
            text("A marvelous new machine!", 360, 140);
            textSize(14);
            text(`You have found a filling machine.

To use this machine, first make a mathematical expression out of numbers and operators. Each number and operator can only be used once (although you may pick up more copies of it later in the game). Then, press [Evaluate] to simplify the expression. Be careful, though: once an expression is evaluated, the numbers and operators in it are used up forever. Also, the machine can only handle integer outputs.

Finally, press [Fill] to begin filling. When filling, you need to select two blocks that line up exactly with each other, as shown below. The distance between them, in grid tiles, needs to be exactly the value of the expression. You can measure this distance by trying to fill without an expression entered. The gap between the blocks will then be filled with a new block.`, 150, 180, 420);
            textAlign(LEFT);
            rect(160, 480, 20, 40);
            rect(160, 540, 20, 40);
            text("Can fill", 200, 520);
            rect(320, 480, 20, 40);
            rect(340, 540, 20, 40);
            text("Cannot fill", 380, 520);
            rect(480, 480, 20, 40);
            rect(480, 540, 10, 40);
            text("Cannot fill", 520, 520);
            textSize(30);
            text('×', 570, 130);
            if (mouseX > 560 && mouseX < 600 && mouseY > 120 && mouseY < 160) {
                cursor(HAND);
                if (clicking) showExplanation = false;
            }
        }

        // Toolbar
        fill(192);
        rect(720, 0, 240, 720);
        fill(0);
        textAlign(CENTER, TOP);
        textSize(18);
        // Numbers and Operators
        strokeWeight(2);
        for (let n = 0; n < 2; n++) {
            var entityArr = [numbers, operators][n], entityDrawFunc = [drawNumber, drawOperator][n];
            for (let r = 0; r < 2; r++) {
                for (let c = 0; c < 5; c++) {
                    const i = r * 5 + c, corner = {x: 730 + c * 46, y: 144 + n * 102 + r * 46};
                    stroke(0);
                    fill(hasMachine ? 255 : 192);
                    if ((mouseX > corner.x && mouseX < corner.x + 36 && mouseY > corner.y && mouseY < corner.y + 36) && hasMachine) {
                        fill(192);
                        cursor(HAND);
                        if (mouseIsPressed) {
                            fill(128);
                            if (entityArr[i] && !filling) {
                                expression += entityArr[i];
                                entityArr[i] = null;
                                evalCol = 255;
                            }
                        }
                    }
                    rect(corner.x, corner.y, 36, 36);
                    if (entityArr[i]) entityDrawFunc(entityArr[i], corner, 36, 36, 0);
                }
            }
        }
        // Expression
        if (hasMachine) {
            // Expression editor
            stroke(0);
            fill(evalCol);
            rect(730, 354, 220, 40);
            fill(255, 0, 0);
            if (mouseX > 910 && mouseX < 950 && mouseY > 354 && mouseY < 394) {
                fill(255, 128, 128);
                cursor(HAND);
                if (clicking && expression && !filling) {
                    const lastChar = expression.slice(-1);
                    if ('+-*/()^√'.includes(lastChar)) fillNull(operators, lastChar);
                    else fillNull(numbers, lastChar);
                    expression = expression.slice(0, -1);
                    evalCol = 255;
                }
            }
            rect(910, 354, 40, 40);
            textSize(24);
            textAlign(CENTER, CENTER);
            fill(255);
            noStroke();
            text('⌫', 930, 374);
            fill(0);
            text(expression, 820, 374);

            // Eval button
            fill(0, 192, 255);
            if (mouseX > 730 && mouseX < 880 && mouseY > 404 && mouseY < 444) {
                fill(0, 160, 224);
                cursor(HAND);
                if (mouseIsPressed) fill(0, 128, 192);
                if (clicking && !filling) {
                    try {
                        var result = math.evaluate(expression.replace(/√/g, 'sqrt').replace(/π/g, 'pi'));
                        if (result.im && Math.abs(result.im) < 0.001) result = result.re;
                        if (math.round(result) != result) throw Error("The filling machine can only handle integer outputs.");
                        expression = result.toString();
                        errMsg = "";
                        evalCol = color(192, 255, 192);
                    } catch (err) {
                        errMsg = err;
                        evalCol = color(255, 192, 192);
                    }
                    okMsg = "";
                }
            }
            stroke(255);
            rect(730, 404, 150, 40);
            drawMachine({x: 740, y: 409}, 30, 30);
            fill(0);
            noStroke();
            text("Evaluate", 820, 424);

            // Fill button
            fill(0, 192, 0);
            if (mouseX > 890 && mouseX < 950 && mouseY > 404 && mouseY < 444) {
                fill(0, 160, 0);
                cursor(HAND);
                if (mouseIsPressed) fill(0, 128, 0);
                if (clicking) {
                    fillSize = parseInt(expression);
                    evalCol = color(192, 192, 255);
                    filling = true;
                    errMsg = "";
                    okMsg = "Select the blocks to fill/measure between.";
                }
            }
            stroke(255);
            strokeWeight(2);
            rect(890, 404, 60, 40);
            noStroke();
            fill(0);
            text("Fill", 920, 424);
            if (filling) {
                // Selecting blocks
                if (selBlocks.length < 2) {
                    entities.forEach(e => {
                        if (e instanceof Block && (mouseX > e.pos.x && mouseX < e.pos.x + e.w && mouseY > e.pos.y && mouseY < e.pos.y + e.h)) {
                            cursor(HAND);
                            if (clicking) {
                                e.selected = !e.selected;
                                if (e.selected) selBlocks.push(e);
                                else selBlocks.splice(selBlocks.indexOf(e), 1);
                            }
                        }
                    });
                // Creating the new block
                } else {
                    var newBlock, expectedSize, wrongSize = false;
                    // Filling vertically
                    if (selBlocks[0].pos.x == selBlocks[1].pos.x && selBlocks[0].w == selBlocks[1].w) {
                        selBlocks.sort((a, b) => a.pos.y - b.pos.y);
                        const bottomY = selBlocks[0].pos.y + selBlocks[0].h;
                        expectedSize = selBlocks[1].pos.y - bottomY;
                        if (expectedSize == fillSize * tileSize) {
                            newBlock = new Block(selBlocks[0].pos.x, bottomY, selBlocks[0].w, selBlocks[1].pos.y - bottomY, true);
                        } else wrongSize = true;
                    // Filling horizontally
                    } else if (selBlocks[0].pos.y == selBlocks[1].pos.y && selBlocks[0].h == selBlocks[1].h) {
                        selBlocks.sort((a, b) => a.pos.x - b.pos.x);
                        const rightX = selBlocks[0].pos.x + selBlocks[0].w;
                        expectedSize = selBlocks[1].pos.x - rightX;
                        if (expectedSize == fillSize * tileSize) {
                            newBlock = new Block(rightX, selBlocks[0].pos.y, selBlocks[1].pos.x - rightX, selBlocks[0].h, true);
                        } else wrongSize = true;
                    } else errMsg = "The selected blocks do not line up.";
                    if (newBlock) {
                        userMadeBlocks[level - 1].push(newBlock);
                        entities.push(newBlock);
                        expression = "";
                        okMsg = "";
                    }
                    if (wrongSize) errMsg = "The fill size does not match the selected blocks.\nExpected size: " + expectedSize / tileSize + " tiles";
                    if (expression && parseFloat(expression) != expression) errMsg = "In order to fill, the expression must be a simplified real number.";
                    selBlocks = [];
                    entities.forEach(e => {
                        if (e instanceof Block) e.selected = false;
                    });
                    evalCol = 255;
                    filling = false;
                }
            }

            // Error/ok msg
            textSize(12);
            textAlign(CENTER, TOP);
            if (errMsg) fill(255, 0, 0);
            else if (okMsg) fill(0, 0, 255);
            else fill(0);
            text(errMsg || okMsg || "Enter an expression. For the √ operator, type √(x) instead of √x.", 730, 455, 220);
        }
    };
    
    this.buttons = [
        new Button(
            "Restart Level",
            760,
            510,
            160,
            60,
            () => {
                level = 0;
                nextLevel = true;
                numbers = Array(10).fill(null);
                operators = Array(10).fill(null);
                hasMachine = false;
                alreadyFound = [];
                showExplanation = filling = false;
                selBlocks = [];
                userMadeBlocks = [... Array(10)].map(a => []);
                expression = "";
                errMsg = okMsg = "";
                evalCol = 255;
                page = "Story";
                fadeTo = "Game";
            }
        )
    ];
}
