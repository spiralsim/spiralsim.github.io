class Rect {
	/**
	 * Internal coordinates are for always the top-left corner. The y alignment is always centered.
	 * @param {Number} x 
	 * @param {Number} y 
	 * @param {Number} w 
	 * @param {Number} h 
	 * @param {string} alignX: One of 'LEFT', 'CENTER', or 'RIGHT'
	 */
	constructor(x, y, w, h, alignX) {
		if (alignX == 'CENTER') this.x = x - w / 2;
		else if (alignX == 'RIGHT') this.x = x - w;
		else this.x = x;
		this.y = y - h / 2;
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

const BUTTON_FADE_RATE = 25;
class Button {
	constructor(txt, x, y, w, h, callback, alignX) {
		this.txt = txt;
		this.rect = new Rect(x, y, w, h, alignX);
		this.callback = callback;
		this.fade = 255;
	}

	run() {
		stroke(0);
		strokeWeight(4);
		fill(this.fade);
		rect(this.rect.x, this.rect.y, this.rect.w, this.rect.h, 5);
		fill(255 - this.fade);
		textAlign(CENTER, CENTER);
		noStroke();
		textSize(24);
		textStyle(NORMAL);
		text(this.txt, this.rect.x + this.rect.w / 2, this.rect.y + this.rect.h / 2);

		if (this.rect.collideMouseCoord) {
			this.fade = max(this.fade - BUTTON_FADE_RATE, 0);
			cursor(HAND);
			if (mouseIsReleased) this.callback();
		} else this.fade = min(this.fade + BUTTON_FADE_RATE, 255);
	}
}

const BOTTOM_BUTTONS_H = 60;
const BOTTOM_BUTTONS_Y = INTRINSIC_H - BOTTOM_BUTTONS_H / 2;

const homeButton = new Button(
	"Main Menu",
	INTRINSIC_W / 2,
	BOTTOM_BUTTONS_Y,
	160,
	BOTTOM_BUTTONS_H,
	() => { sceneManager.showScene(Menu); },
	'CENTER'
);
