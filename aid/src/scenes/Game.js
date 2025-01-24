const CELL_SIZE = 30, PLAYER_H = CELL_SIZE * 0.8;
// Scale factors computed based on target player height
const CHARACTER_SCALE_FACTOR = PLAYER_H / CAPTAIN_ZERO_ORIGINAL_DIMENSIONS[1];
const PLAYER_W = CAPTAIN_ZERO_ORIGINAL_DIMENSIONS[0] * CHARACTER_SCALE_FACTOR;
const INFINITUS_W = INFINITUS_ORIGINAL_DIMENSIONS[0] * CHARACTER_SCALE_FACTOR,
    INFINITUS_H = INFINITUS_ORIGINAL_DIMENSIONS[1] * CHARACTER_SCALE_FACTOR;
const RELOAD_TIME = 60;

const LEVEL_WITH_MACHINE = 4;

var curLevel;
var entities;
var player;
var inventory, selectedSlots;
var expression, expressionMsg;
var machineButtons, fillButton;

var hasMachine;
var showingManual, filling, fillSize, selBlocks;
var spawnPos, playerScale;

if (false) { //devmode
    page = "Game";
    fadeTo = null;
    curLevel = 5;
    hasMachine = true;
}

const NUM_SLOTS = 9, SLOT_SIZE = 30, NUM_TOOLBAR_ROWS = 2;
class ToolbarButton extends Button {
    isSelected = false;

	constructor(rowIndex, colIndex, onClick, bgColor, txt) {
		super(
			new Rect(
				gridColToX(colIndex, NUM_SLOTS, SLOT_SIZE),
				INTRINSIC_H - SLOT_SIZE * (NUM_TOOLBAR_ROWS - rowIndex),
				SLOT_SIZE,
				SLOT_SIZE,
				'CENTER',
                'TOP'
			),
			onClick
		);
        this.bgColor = bgColor;
        this.txt = txt;
	}

	run() {
		super.run();
        this.noFadeBgColor = this.isSelected ? color(128, 128, 255, 192) : this.bgColor;
		fill(lerpColor(this.noFadeBgColor, color(192, 192), this.fade / 2));
		strokeWeight(2);
		stroke(0);
		square(this.r.x, this.r.y, this.r.w);
        fill(255);
        noStroke();
        textSize(SLOT_SIZE / 2);
        this.centerText();
	}
}

class FillButton extends Button {
    isSelected = false;

	constructor(rowIndex, colIndex, onClick, bgColor, txt) {
		super(
			new Rect(
				gridColToX(colIndex, NUM_SLOTS, SLOT_SIZE),
				INTRINSIC_H - SLOT_SIZE * (NUM_TOOLBAR_ROWS - rowIndex),
				SLOT_SIZE,
				SLOT_SIZE,
				'CENTER',
                'TOP'
			),
			onClick
		);
        this.bgColor = bgColor;
        this.txt = txt;
	}

	run() {
		super.run();
        this.noFadeBgColor = this.isSelected ? color(128, 128, 255, 192) : this.bgColor;
		fill(lerpColor(this.noFadeBgColor, color(192, 192), this.fade / 2));
		strokeWeight(2);
		stroke(0);
		square(this.r.x, this.r.y, this.r.w);
        fill(255);
        noStroke();
        textSize(SLOT_SIZE / 2);
        this.centerText();
	}
}

class InventoryButton extends ToolbarButton {
	item = null;

	constructor(index) {
		super(
            1,
            index,
            () => {
                if (selBlocks.length < 2 || this.isSelected) return;
                this.isSelected = true;
                expression += this.item.name;
                selectedSlots.push(this);
            },
            color(255, 192),
            ''
        );
	}

	setItem(item) {
		this.item = item;
	}
	run() {
		super.run();
		if (this.item) this.item.draw(createVector(this.r.x, this.r.y));
	}
}

class CloseManualButton extends Button {
	static S = 30;

	constructor(pos) {
		super(
			new Rect(pos.x, pos.y, CloseManualButton.S, CloseManualButton.S),
			() => { showingManual = false; }
		);
	}

	run() {
		super.run();
		fill(lerp(255, 128, this.fade), 192);
		circle(this.r.x + this.r.w / 2, this.r.y + this.r.h / 2, this.r.w);
		noStroke();
		textSize(30);
		fill(0);
		textAlign(CENTER, CENTER)
        text('×', this.r.x + this.r.w / 2, this.r.y + this.r.h / 2);
	}
}
const closeManualButton = new CloseManualButton({x: 800, y: 130});

function drawManual() {
    fill(255);
    rect(120, 120, 720, 480, 20);
    fill(0);
    textSize(36);
    text("Filling Machine Manual", INTRINSIC_W / 2, 140);
    textSize(24);
    textAlign(LEFT);
    text(`1

2
3




Note that the two blocks must align exactly:`, 150, 180);
    text(`You can fill the gap between any two aligned blocks. To do so, select the blocks by pressing them in any order.
    To cancel the fill, deselect one of the blocks.
    Type a mathematical expression by pressing on numerals and operators in your inventory. When the expression evaluates to the required distance, the gap will be filled by a new block.`, 170, 180, 640);
    rect(160, 480, 20, 40);
    rect(160, 540, 20, 40);
    text('✓', 200, 520);
    rect(380, 480, 20, 40);
    rect(400, 540, 20, 40);
    text('×', 440, 520);
    rect(640, 480, 20, 40);
    rect(640, 540, 10, 40);
    text('×', 680, 520);
    closeManualButton.run();
}

class Game extends Scene {
    hasTintedBackground = false;

    constructor() {
        super();
        this.buttons.push(new TransitionButton(
            new Rect(
                0,
                INTRINSIC_H,
                160,
                60,
                'LEFT',
                'BOTTOM'
            ),
            () => { SceneManager.fadeToScene(Game, curLevel); },
            'Reset Level'
        ));
        this.buttons.push(new HomeButton(true));
        machineButtons = [
            new ToolbarButton(
                0,
                NUM_SLOTS - 2,
                () => {
                    if (!expression) return;
                    expression = expression.slice(0, -1);
                    selectedSlots.pop().isSelected = false;
                },
                color(255, 0, 0, 192),
                '⌫'
            ),
            new ToolbarButton(
                0,
                NUM_SLOTS - 1,
                () => { showingManual = true; },
                color(0, 192, 0, 192),
                '?'
            )
        ];
    }

    /**
     * Starts level number `nxtLevel` from its initial state.
     * Can be re-run on the same level to restart.
     * @param {*} nxtLevel The level number
     */
    enter(nxtLevel = curLevel) {
        nxtLevel = this.sceneArgs ?? nxtLevel;
        curLevel = nxtLevel;
        this.background = images.backgrounds[curLevel - 1];
        entities = LEVELS_DATA[curLevel - 1].entities
            .map(e => eval(`new ${e[0]}(...${JSON.stringify(e.slice(1))})`));
        player = new Player();
        entities.push(player);
        inventory = Array(9).fill(0).map((_, i) => new InventoryButton(i));
        hasMachine = curLevel > LEVEL_WITH_MACHINE;
        expression = '';
        selectedSlots = [];
        selBlocks = new Set();
        showingManual = false;
        filling = false;
        playerScale = nxtLevel;
    }
    
    draw() {
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
        // If the player falls off the map, restart
        if (player.pos.x < 0 || player.pos.x > INTRINSIC_W || player.pos.y > INTRINSIC_H) this.enter();

        // Game drawing
        drawScaleRing(INTRINSIC_W / 2, INTRINSIC_H / 2, 600, playerScale);
        entities.forEach(e => e.run());
        entities = entities.filter(e => !e.deleteMe);
        if (showingManual) drawManual();

        // Toolbar
        const toolbarX = inventory[0].r.x;
        const toolbarY = INTRINSIC_H - CELL_SIZE * 2;

        // Inventory row
        if (inventory.some(b => b.item != null))
            inventory.forEach(b => { b.run(); });
        
        // Machine row
        if (hasMachine) {
            // Expression
            stroke(0);
            fill(255, 192);
            rect(toolbarX, toolbarY, SLOT_SIZE * (NUM_SLOTS - machineButtons.length), SLOT_SIZE);
            noStroke();
            textAlign(LEFT, CENTER);
            if (selBlocks.length < 2) {
                fill(128);
                expressionMsg = 'Select blocks...';
            } else {
                fill(0);
                expressionMsg = expression;
            }
            text(expressionMsg, toolbarX + 5, toolbarY + SLOT_SIZE / 2);
            // Buttons
            machineButtons.forEach(b => b.run());

            // Filling gap
            if (selBlocks.length == 2) {
                var [a, b] = Array.from(selBlocks);
                var newBlock = null, gapSize;
                if (a.pos.x == b.pos.x && a.w == b.w) {
                    // Filling vertically
                    if (a.pos.y > b.pos.y) [a, b] = [b, a];
                    const bottomY = a.pos.y + a.h;
                    gapSize = b.pos.y - bottomY;
                    newBlock = new Block(a.pos.x, bottomY, a.w, gapSize, true);
                } else if (a.pos.y == b.pos.y && a.h == b.h) {
                    // Filling horizontally
                    if (a.pos.x > b.pos.x) [a, b] = [b, a];
                    const rightX = a.pos.x + a.w;
                    gapSize = b.pos.x - rightX;
                    newBlock = new Block(rightX, a.pos.y, gapSize, a.h, true);
                } else a.toggle(), b.toggle(); // Misaligned
                if (newBlock) {
                    var evaluation;
                    try {
                        evaluation = math.evaluate(expression.replace(/√/g, 'sqrt').replace(/π/g, 'pi'));
                        if (evaluation.im) {
                            if (Math.abs(evaluation.im) < 0.001) evaluation = evaluation.re; // Handles e^(iπ)
                            else throw Error('Output is non-real');
                        }
                        if (math.round(evaluation) != evaluation) throw Error('Output is non-integer');
                        if (evaluation * CELL_SIZE == gapSize) {
                            entities.push(newBlock);
                            expression = '';
                            // selectedSlots = [];
                            a.toggle(), b.toggle();
                        }
                    } catch (err) {}
                }
            }
        }
    }
}
