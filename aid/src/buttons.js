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
		textStyle(NORMAL);
		text(this.txt, this.rect.x + this.rect.w / 2, this.rect.y + this.rect.h / 2);
		
		this.active = true;
		if (this.rect.collideMouseCoord) {
			this.fade = max(this.fade - BUTTON_FADE_RATE, 0);
			cursor(HAND);
			if (mouseIsReleased) this.callback();
		} else this.fade = min(this.fade + BUTTON_FADE_RATE, 255);
	};
}

const HOME_BUTTON_W = 160;
const homeButton = new Button(
	"Main Menu",
	INTRINSIC_MAIN_S / 2 - HOME_BUTTON_W / 2,
	630,
	HOME_BUTTON_W,
	60,
	() => { mgr.showScene(Menu); }
);
