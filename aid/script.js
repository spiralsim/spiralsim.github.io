/**
 * Solutions can be found starting on line 510.
 */
var canvas, images = {
	openingScene: null,
	storyline: [],
	backgrounds: [],
	characters: [],
	entities: [],
	CZratio: 158 / 256, // ratio of captain zero's width to height
	INFratio: 112 / 256 // ratio of infinitus' height to width
};
const dimensions = [960, 720];
const assetPath = "images";
function preload () {
	// Load images
	images.openingScene = loadImage(`${assetPath}/opening-scene.png`);
	for (let i = 1; i <= 3; i++) images.storyline.push(loadImage(`${assetPath}/storyline/story${i}.png`));
	for (let i = 1; i <= levels.length; i++) images.backgrounds.push(loadImage(`${assetPath}/backgrounds/${i}.png`));
	["CaptainZero", "Infinitus"].forEach(n => {
		images.characters.push(loadImage(`${assetPath}/characters/${n}.png`));
	});
	["FillerArrow", "CannonArrow"].forEach(n => {
		images.entities.push(loadImage(`${assetPath}/entities/${n}.png`));
	});
}
function setup () {
	canvas = createCanvas(dimensions[0], dimensions[1]);
	canvas.parent('processingCanvas');
	document.getElementsByTagName('body')[0].setAttribute('style', "background-color: black");
}

function Button (txt, x, y, w, h, onClick) {
	this.txt = txt;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.onClick = onClick;
	this.hover = false;
	this.active = false;
	this.fade = 255;

	this.run = function () {
		stroke(0);
		strokeWeight(4);
		fill(this.fade);
		rect(this.x, this.y, this.w, this.h, 5);
		fill(255 - this.fade);
		textAlign(CENTER, CENTER);
		noStroke();
		textSize(24);
		text(this.txt, this.x + this.w / 2, this.y + this.h / 2);
		
		this.active = true;
		if (mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h) {
			this.fade = max(this.fade - 20, 0);
			cursor(HAND);
			this.hover = true;
		}
	};
}
var buttons = [];
for (let i = 0; i < 3; i++) {
	buttons.push(new Button(
		["Start", "About", "Credits"][i],
		300,
		300 + 120 * i,
		360,
		90,
		() => {
			page = ["Story", "About", "Credits"][i];
			fadeTo = null;
		}
	));
}
homeButton = new Button(
	"Main Menu",
	420,
	600,
	160,
	60,
	() => {
		page = "Home";
	}
);
buttons.push(homeButton);
// indices 4-6
buttons.push(
	new Button(
		"Back",
		480,
		600,
		100,
		60,
		() => {
			if (storyPage > 1) storyPage--;
		}
	),
	new Button(
		"Continue",
		600,
		600,
		140,
		60,
		() => { storyPage++; }
	),
	new Button(
		"Skip story",
		760,
		600,
		140,
		60,
		() => { storyPage = 7; }
	)
);
// index 7
restartButton = new Button(
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
);
buttons.push(restartButton);
function mouseReleased () {
	buttons.forEach(b => {
		if (b.hover && b.active) b.onClick();
	});
	clicking = true;
}

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
	Entity.call(this, 0, 0, playerSize * images.CZratio, playerSize);
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
		fill.apply(null, levels[level - 1].blockCol);
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
		fill.apply(null, levels[level - 1].textCol);
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
const levels = [
	// 1
	{
		entities: [
			["Block", 60, 360, 600, 30],
			["Block", 60, 180, 30, 180],
			["Block", 630, 180, 30, 180],
			["Spawn", 90, 330],
			["Finish", 600, 330, 30, 30],
			["Block", 300, 330, 120, 30],
			["Text", "Use the arrow keys to move. Your goal in each level is to reach the finish portal.\n\nEach time you reach the portal, you climb a little closer to infinity! However, nobody knows what waits at the end, for nobody has been there.", 360, 180, 540]
		],
		blockCol: [128, 64, 0],
		textCol: [255]
	},
	// 2
	{
		entities: [
			["Block", 60, 540, 240, 30],
			["Spawn", 60, 510],
			["Block", 270, 570, 180, 30],
			["Lava", 300, 550, 120, 20],
			["Block", 420, 510, 30, 60],
			["Block", 450, 480, 120, 30],
			["Block", 570, 420, 30, 30],
			["Block", 630, 390, 30, 30],
			["Block", 540, 330, 60, 30],
			["Finish", 540, 300, 30, 30],
			["Text", "Lava is dangerous. Also, don't fall into the void!", 360, 210]
		],
		blockCol: [0, 128, 0],
		textCol: [255]
	},
	// 3
	{
		entities: [
			["Block", 60, 540, 240, 30],
			["Block", 60, 480, 30, 60],
			["Spawn", 90, 510],
			["Trampoline", 240, 530, 60, 10],

			["Block", 270, 430, 300, 30],
			["Trampoline", 450, 420, 120, 10],
			["Lava", 450, 300, 30, 30],
			["Lava", 540, 300, 30, 30],
			["Finish", 540, 230, 30, 30],
			["Text", "Trampolines are bouncy.", 360, 210]
		],
		blockCol: [128],
		textCol: [0, 128, 0]
	},
	// 4
	/**
	 * Intended solution (numbers in brackets get used to fill, numbers/
	 * operators in braces are carried over from previous levels):
	 * 7 + 2 = [9]
	 * Left over: -
	 */
	{
		entities: [
			["Block", 60, 300, 30, 60],
			["Block", 60, 360, 240, 30],
			["Spawn", 90, 330],
			["_Number", 180, 330, '2'],
			["Operator", 210, 330, '+'],
			["_Number", 240, 330, '7'],
			["Machine", 270, 330],
			["Block", 570, 360, 90, 30],
			["Finish", 630, 330, 30, 30],
			["Text", "Numbers, operators, and a funny machine...\n\nPerhaps they can help you get across this gap?", 360, 150]
		],
		blockCol: [0, 192, 255],
		textCol: [255]
	},
	// 5
	/**
	 * Intended solution (numbers in brackets get used to fill, numbers/
	 * operators in braces are carried over from previous levels):
	 * 4 + 1 = 5
	 * 5 ^ 2 {-} 7 = [18]
	 * Left over: 8, *
	 */
	{
		entities: [
			["Block", 60, 510, 150, 30],
			["Spawn", 60, 480],
			["_Number", 120, 450, '4'],
			["_Number", 150, 450, '1'],
			["_Number", 180, 450, '2'],
			["Operator", 120, 480, '+'],
			["Trampoline", 250, 570, 10, 30],
			["Lava", 270, 540, 30, 90],
			["Lava", 270, 420, 30, 30],
			["Trampoline", 310, 600, 10, 30],
			["Operator", 300, 540, '^'],

			["Block", 300, 420, 30, 30],
			["Block", 330, 450, 30, 30],
			["Block", 360, 480, 60, 30],
			["_Number", 360, 450, '7'],
			["Block", 390, 450, 60, 30],
			["Block", 420, 420, 30, 30],
			["Block", 450, 360, 210, 30],
			["Operator", 540, 330, '-'],
			["Trampoline", 630, 350, 30, 10],

			["Block", 600, 240, 30, 30],
			["Block", 30, 240, 30, 30],
			["Finish", 120, 120, 30, 30],
			["Text", "Remember to be creative and use your resources.", 360, 90]
		],
		blockCol: [255],
		textCol: [255]
	},
	// 6
	/**
	 * Intended solution (numbers in brackets get used to fill, numbers/
	 * operators in braces are carried over from previous levels):
	 * {8} / 2 = [4] (use to block the space under the group of 8 cannons)
	 * Left over: *
	 */
	{
		entities: [
			["Block", 60, 420, 30, 60],
			["Block", 60, 480, 120, 30],
			["Spawn", 90, 450],
			["_Number", 210, 420, '8'],
			["Block", 270, 480, 150, 30],
			["_Number", 330, 450, '2'],
			["Operator", 150, 450, '/'],
			["Lava", 420, 510, 90, 30],
			["Block", 510, 480, 150, 30],
			["Trampoline", 630, 470, 30, 10],

			["Block", 270, 240, 30, 60],
			["Cannon", 240, 270],
			["Block", 300, 270, 330, 30],
			["Block", 420, 360, 30, 30],
			["Cannon", 480, 300],
			["Cannon", 510, 300],
			["Cannon", 540, 300],
			["Cannon", 570, 300],
			["Cannon", 480, 330],
			["Cannon", 510, 330],
			["Cannon", 540, 330],
			["Cannon", 570, 330],
			["Block", 570, 360, 60, 30],
			["Block", 600, 300, 30, 60],
			["Finish", 300, 240, 30, 30],
			
			["Text", "This is the cannon, the last object type you'll see.", 360, 150]
		],
		blockCol: [255, 128, 0],
		textCol: [255]
	},
	// 7
	/**
	 * Intended solution (numbers in brackets get used to fill, numbers/
	 * operators in braces are carried over from previous levels):
	 * √(4) = [2]
	 * 9 + 5 - 1 = [13]
	 */
	{
		entities: [
			["Block", 60, 630, 150, 30],
			["Spawn", 60, 600],
			["_Number", 120, 600, '9'],
			["_Number", 180, 600, '1'],
			["Cannon", 120, 480],
			["Lava", 210, 630, 90, 30],
			["Operator", 240, 570, '√'],
			["Block", 300, 630, 30, 30],
			["Trampoline", 300, 620, 30, 10],
			["Block", 360, 630, 30, 30],
			["Trampoline", 360, 620, 30, 10],
			["Operator", 330, 570, '('],
			["Cannon", 390, 510],
			["Operator", 330, 480, ')'],

			["Block", 390, 480, 240, 30],
			["_Number", 390, 450, '5'],
			["Operator", 420, 450, '-'],
			["Trampoline", 600, 470, 30, 10],
			["Operator", 600, 390, '+'],
			["Block", 390, 390, 210, 30],
			["Block", 180, 390, 30, 30],
			["_Number", 180, 360, '4'],
			["Block", 60, 450, 120, 30],
			["Trampoline", 60, 440, 30, 10],

			["Block", 100, 330, 20, 30],
			["Trampoline", 120, 330, 510, 30],
			["Trampoline", 90, 320, 60, 10],
			["Trampoline", 90, 330, 10, 30],
			["Cannon", 600, 300],
			["Cannon", 600, 270],
			["Cannon", 570, 300],
			["Cannon", 570, 270],
			["Cannon", 540, 300],
			["Cannon", 540, 270],
			["Cannon", 510, 300],
			["Cannon", 510, 270],
			["Block", 100, 210, 20, 60],
			["Trampoline", 90, 210, 10, 60],
			["Trampoline", 120, 240, 510, 30],
			["Trampoline", 90, 270, 60, 10],
			["Trampoline", 630, 240, 30, 120],
			
			["Block", 120, 180, 30, 30],
			["Block", 120, 210, 30, 30],
			["Lava", 150, 210, 510, 30],
			["Block", 540, 180, 120, 30],
			["Finish", 630, 150, 30, 30],
			
			["Text", "Put it all together now!", 360, 90, 540]
		],
		blockCol: [128, 64, 128],
		textCol: [255]
	},
	// 8
	/**
	 * Intended solution (numbers in brackets get used to fill, numbers/
	 * operators in braces are carried over from previous levels):
	 * e ^ (i * π) + 9 = [8]
	 * Left over: None
	 */
	{
		entities: [
			["Block", 60, 360, 300, 30],
			["Spawn", 60, 330],
			["_Number", 90, 330, 'i'],
			["Operator", 120, 330, '('],
			["_Number", 150, 330, '9'],
			["Operator", 180, 330, '*'],
			["Operator", 210, 330, ')'],
			["_Number", 240, 330, 'e'],
			["Operator", 270, 330, '+'],
			["_Number", 300, 330, 'π'],
			["Operator", 330, 330, '^'],
			["Block", 600, 360, 120, 30],
			["Finish", 690, 330, 30, 30]
		],
		blockCol: [64],
		textCol: [255]
	}
];
function generateLevel () {
	entities = [];
	levels[level - 1].entities.forEach(entity => {
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
// Storyline
var storyPage = 1;
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
function draw () {
	if (!loaded) {
		document.getElementById("pjsLoadingMessage").innerHTML = '';
		loaded = true;
	}
	buttons.forEach(b => {
		b.active = false;
		if (!b.hover) b.fade = min(b.fade + 20, 255);
		b.hover = false;
	});
	textFont("Georgia");
	textAlign(CENTER);
	cursor(ARROW);

	switch (page) {
		case "Home":
			image(images.openingScene, 0, 0);
			stroke(255);
			strokeWeight(3);
			fill(0);
			textSize(60);
			text("Adventures in Digitopolis", 480, 100);
			textSize(30);
			text("A tale of Captain Zero and Infinitus", 480, 160);
			buttons[0].run();
			break;

		case "Story":
			background(storyPage >= 5 ? color(210, 209, 204) : 255);
			fill(0);
			textSize(30);
			if ('16'.includes(storyPage)) {
				textAlign(CENTER, CENTER);
				textStyle(ITALIC);
				textSize(36);
			} else {
				textAlign(LEFT, TOP);
				textSize(24);
			}
			
			switch (storyPage) {
				case 1:
					tint(255, 25);
					image(images.openingScene, 0, 0);
					tint(255, 255);
					textAlign(CENTER, CENTER);
					rectMode(CENTER);
					text(`Our story begins with Milo's adventures in the Kingdom of Digitopolis, ruled by the Mathemagician and hidden away in the vast Lands Beyond...`, 480, 240, 600);
					textSize(24);
					text(`Excerpted from "Childcraft: The How and Why Library",\nVolume 13 (©1985), p. 93–113`, 480, 390);
					rectMode(CORNER);
					
					break;
				case 2:
					text(`\t"Can you show me the biggest number there is?" asked Milo.
\t"I'd be delighted," replied the Mathemagician, opening one of the closet doors. "We keep it right here. It took four miners just to dig it out."
\tInside was the biggest











Milo had ever seen. It was fully twice as high as the Mathemagician.`, 80, 80, 800);
					image(images.storyline[0], 80, 200, 318, 304);
					break;
				case 3:
					text(`	"No, that's not what I mean," objected Milo. "Can you show me the longest number there is?"
	"Surely," said the Mathemagician, opening another door. "Here it is. It took three carts to carry it here."
	Inside this closest was the longest











imaginable. It was just about as wide as the three was high.`, 80, 80, 800);
					image(images.storyline[1], 80, 220, 640, 320);
					break;
				case 4:
					text(`	"No, no, no, that's not what I mean either," he said, looking helplessly at Tock.
	"I think what you would like to see," said the dog, scratching himself just under half-past four, "is the number of greatest possible magnitude."
	"Well, why didn't you say so?" said the Mathemagician, who was busily measuring the edge of a raindrop.
	...
	"Just follow that line forever," said the Mathemagician, "and when you reach the end, turn left. There you'll find the land of Infinity, where the tallest, the shortest, the biggest, the smallest, and the most and the least of everything are kept."`, 80, 80, 800);
					break;
				case 5:
					text(`...
	Milo bounded across the room and started up the stairs two at a time. "Wait for me, please," he shouted to Tock and the Humbug. "I'll be gone just a few minutes."`, 80, 80, 600);
					image(images.storyline[2], 708, 30, 192, 544);
					break;
				case 6:
					text(`Of course, Milo could never reach Infinity, for he is only a mortal.
But you are no mere mortal. You are Captain Zero; it is your destiny to meet the immortal Infinitus.`, 120, 180, 720);
					image(images.characters[0], 480 - (180 * images.CZratio) / 2, 360, 180 * images.CZratio, 180);
					break;
				default:
					fadeTo = "Game";
			}
			textStyle(NORMAL);
			homeButton.x = 60;
			if (!fadeIn) for (let i = 3; i <= 6; i++) buttons[i].run();
			break;

		case "Game":
			// Scene changing
			if (nextLevel) {
				level++;
				if (level > levels.length) {
					CZy = player.pos.y + player.h / 2;
					page = "End";
					break;
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
			textSize(30);
			textAlign(CENTER, TOP);
			text("Adventures in\nDigitopolis", 840, 10);
			textSize(18);
			text("Level " + level, 840, 90);
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
			// Buttons
			homeButton.x = 760;
			homeButton.run();
			// restartButton.run();
			break;

		case "End":
			background(0);
			imageMode(CENTER);
			// Animation phase 1: Make the game elements fade away, make everything currently on the screen align
			if (ringX < 480) {
				gameFade -= 255 / 60;
				imageMode(CORNER);
				tint(255, gameFade);
				image(images.backgrounds[levels.length - 1], 0, 0);
				image(toolbarImg, 720, 0);
				tint(255, 255);
				ringX += 2;
				imageMode(CENTER);
				CZy = 360 + (CZy - 360) * 0.99;
				image(images.characters[0], 720, CZy, playerSize * images.CZratio, playerSize);
				scaleRing(ringX, 360, 600, levels.length);
			// Animation phase 2: Zoom out to infinity
			} else if (playerScale < 1000) {
				playerScale *= 1.01;
				for (let i = floor(playerScale - 10); i <= playerScale; i++) {
					scaleRing(ringX, 360, 10 ** (i - playerScale) * 600, i);
				}
				image(images.characters[0], 720, 360, playerSize * images.CZratio, playerSize);
			// Animation phase 3: Infinitus fades in and fights Captain Zero
			} else if (!finishedAnim) {
				if (fightPos) scaleRing(ringX, 360, 600, '∞');
				// Fade in
				if (infinitusFade < 255) {
					infinitusFade += 255 / 360;
					tint(255, infinitusFade);
					image(images.characters[1], 240, 360, playerSize, playerSize * images.INFratio);
					tint(255, 255);
					image(images.characters[0], 720, 360, playerSize * images.CZratio, playerSize);
				// Characters fly at each other
				} else if (fightPos) {
					fightPos -= 3;
					image(images.characters[1], 480 - fightPos, 360, playerSize, playerSize * images.INFratio);
					image(images.characters[0], 480 + fightPos, 360, playerSize * images.CZratio, playerSize);
				// Explosion
				} else if (explosionSize < 2000) {
					const alpha = 255 - explosionSize / 8;
					explosionSize += 10;
					fill(255, 0, 0, alpha);
					ellipse(480, 360, explosionSize, explosionSize);
					fill(255, 128, 0, alpha);
					ellipse(480, 360, explosionSize * 2/3, explosionSize * 2/3);
					fill(255, 255, 0, alpha);
					ellipse(480, 360, explosionSize * 1/3, explosionSize * 1/3);
				} else finishedAnim = true;
			// Animation phase 4: The End
			} else {
				endFade += 255 / 240;
				fill(255, endFade);
				textSize(96);
				text("The End", 480, 300);
				textSize(48);
				text("Thank you for playing", 480, 400);
				if (endFade == 255) noLoop();
			}
			break;

		case "About":
			background(192);
			noStroke();
			fill(0);
			textSize(60);
			text("About", 480, 100);
			textSize(36);
			text("By Jeffrey Tong", 480, 150);
			textAlign(LEFT);
			textSize(20);
			text(`Adventures in Digitopolis is a game made for the L'Hopital's Rule creative interpretation project in the Analysis I class. It is inspired by the short story \"Milo in Digitopolis\", itself part of The Phantom Tollbooth by Norton Juster. The story was one my inspirations for getting into math, both as a hobby and competitively.

Included in the source code of this program (https://repl.it/@spiralsim/Adventures-in-Digitopolis) are my intended solutions for each of the later levels. They are not necessarily the only or best solutions, but they are the only ones I could find. I spent a lot of effort coming up with hard math problems, so you should find them challenging.`, 80, 220, 800);
			homeButton.x = 420;
			homeButton.run();
			break;

		case "Credits":
			background(192);
			noStroke();
			fill(0);
			textSize(60);
			text("Credits", 480, 100);
			textAlign(LEFT);
			textSize(20);
			text(`[Storyline]
All dialogue and images used in the opening scene and storyline were taken directly from "Milo in Digitopolis", specifically in the book 
			
[Levels]
The sources for the background images for each level are linked below:
[1] From the book
[2] https://www.publicdomainpictures.net/en/view-image.php?
image=303207&picture=grass-and-sky-background
[3] https://www.vecteezy.com/vector-art/298133-a-dark-stone-cave
[4] https://unsplash.com/photos/JpgcXXhpel0
[5] https://freeartbackgrounds.com/?800,beautiful-blue-sky-with-clouds-background
[6] https://wallpaperaccess.com/planet-earth
[7] https://commons.wikimedia.org/wiki/File:Solar_sys.jpg
[8] https://solarsystem.nasa.gov/resources/285/the-milky-way-galaxy/
[9] https://www.nasa.gov/press/2014/june/hubble-team-unveils-most-colorful-
view-of-universe-captured-by-space-telescope`, 80, 150, 800);
			homeButton.x = 420;
			homeButton.run();
			break;
	}

	if (fadeTo && page != fadeTo) {
		fadeIn += 5;
		if (fadeIn == 255) page = fadeTo;
	} else {
		if (fadeIn) fadeIn -= 5;
		else fadeTo = null;
	}
	const fadeCol = fadeTo == "End" ? 255 : 0;
	fill(fadeCol, fadeCol, fadeCol, fadeIn);
	rect(0, 0, width, height);
	clicking = false;
};