const CELL_SIZE = 30, PLAYER_H = CELL_SIZE * 0.8;
const RELOAD_TIME = 60;

var level = 0;
var entities = [];
var player;
var inventory = Array(9).fill(null);
var hasMachine = false;
var expression;
var evalCol = 255;
var errMsg = '';
var showExplanation = false, filling = false, okMsg = "", fillSize, selBlocks = [], userMadeBlocks = [...Array(10)].map(a => []);
var spawnPos, playerScale = 1;

if (false) { //devmode
    page = "Game";
    fadeTo = null;
    level = 5;
    hasMachine = true;
}

class Game extends Scene {
    constructor() {
        super();
        this.buttons.push(new Button(
            'Restart Level',
            INTRINSIC_W - 200,
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
                userMadeBlocks = [...Array(10)].map(a => []);
                expression = "";
                errMsg = okMsg = "";
                evalCol = 255;
                page = "Story";
                fadeTo = "Game";
            }
        ));
        this.buttons.push(new HomeButton(true));
    }
    
    draw() {
        if (nextLevel) {
            level++;
            if (level > levelsData.length) {
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
                    const i = r * 5 + c, corner = { x: 730 + c * 46, y: 144 + n * 102 + r * 46 };
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
            drawMachine({ x: 740, y: 409 }, 30, 30);
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
    }
}
