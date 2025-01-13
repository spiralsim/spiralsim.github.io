var canvas, images = {
	openingScene: null,
	storyline: [],
	backgrounds: [],
	characters: [],
	entities: [],
	CAPTAIN_ZERO_RATIO: 158 / 256, // ratio of captain zero's width to height
	INFINITUS_RATIO: 112 / 256 // ratio of infinitus' height to width
};
const DIMENSIONS = [960, 720];
const INTRINSIC_MAIN_S = 720; // Side length of central content square before scaling
const ASSET_PATH = 'images';

class Rect {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	get collideMouseCoord() {
		return (
			mouseCoordX > this.x &&
			mouseCoordX < this.x + this.w &&
			mouseCoordY > this.y &&
			mouseCoordY < this.y + this.h
		);
	}
}

const BUTTON_FADE_RATE = 20;
function Button(txt, x, y, w, h, callback) {
	this.txt = txt;
	this.rect = new Rect(x, y, w, h);
	this.callback = callback;
	this.hover = false;
	this.active = false;
	this.fade = 255;

	this.run = function () {
		stroke(0);
		strokeWeight(4);
		fill(this.fade);
		rect(this.rect.x, this.rect.y, this.rect.w, this.rect.h, 5);
		fill(255 - this.fade);
		textAlign(CENTER, CENTER);
		noStroke();
		textSize(24);
		text(this.txt, this.rect.x + this.rect.w / 2, this.rect.y + this.rect.h / 2);
		
		this.active = true;
		if (this.rect.collideMouseCoord) {
			this.fade = max(this.fade - BUTTON_FADE_RATE, 0);
			cursor(HAND);
			if (mouseIsReleased) this.callback();
		} else this.fade = min(this.fade + BUTTON_FADE_RATE, 255);
	};
}

/**
 * Loads images
 */
function preload() {
	const LEVELS = loadJSON('levels.json');
	images.openingScene = loadImage(`${ASSET_PATH}/opening-scene.png`);
	for (let i = 1; i <= 3; i++) images.storyline.push(loadImage(`${ASSET_PATH}/storyline/story${i}.png`));
	for (let i = 1; i <= LEVELS.length; i++) images.backgrounds.push(loadImage(`${ASSET_PATH}/backgrounds/${i}.png`));
	['CaptainZero', 'Infinitus'].forEach(n => 
		images.characters.push(loadImage(`${ASSET_PATH}/characters/${n}.png`)));
	['FillerArrow', 'CannonArrow'].forEach(n =>
		images.entities.push(loadImage(`${ASSET_PATH}/entities/${n}.png`)));
	document.getElementById('p5_loading').remove();
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent('body');
	document.getElementsByTagName('body')[0].setAttribute('style', 'background-color: black');

    var mgr = new SceneManager();
    // mgr.bkImage = bkImage; // inject bkImage property
    mgr.wire();
    mgr.showScene(Menu);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}
