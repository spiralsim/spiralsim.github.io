class Rect {
	/**
	 * Internal coordinates are for always the top-left corner. The y alignment is always centered.
	 * @param {Number} x 
	 * @param {Number} y 
	 * @param {Number} w 
	 * @param {Number} h 
	 * @param {string} horizAlign: 'LEFT' (default), 'CENTER', or 'RIGHT'
	 * @param {string} vertAlign: 'TOP' (default), 'CENTER', or 'BOTTOM'
	 */
	constructor(x, y, w, h, horizAlign, vertAlign) {
		if (horizAlign == 'CENTER') this.x = x - w / 2;
		else if (horizAlign == 'RIGHT') this.x = x - w;
		else this.x = x;
		if (vertAlign == 'CENTER') this.y = y - h / 2;
		else if (vertAlign == 'BOTTOM') this.y = y - h;
		else this.y = y;
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

class Button {
	/**
	 * @param {Rect} r: The button's hitbox
	 */
	constructor(r, onClick) {
		this.r = r;
		this.onClick = onClick;
	}

	onHover() {
		cursor(HAND);
		if (mouseIsReleased) this.onClick();
	}
	onNoHover() {}
	run() {
		if (this.r.collideMouseCoord) this.onHover();
		else this.onNoHover();
	}
}

const BUTTON_FADE_RATE = 25;
class TransitionButton extends Button {
	constructor(r, onClick, txt) {
		super(r, onClick);
		this.txt = txt;
		this.fade = 255;
	}

	onHover() {
		super.onHover();
		this.fade = max(this.fade - BUTTON_FADE_RATE, 0);
	}
	onNoHover() {
		super.onNoHover();
		this.fade = min(this.fade + BUTTON_FADE_RATE, 255);
	}
	run() {
		super.run();
		stroke(0);
		strokeWeight(4);
		fill(this.fade);
		rect(this.r.x, this.r.y, this.r.w, this.r.h, 5);
		fill(255 - this.fade);
		textAlign(CENTER, CENTER);
		noStroke();
		textSize(24);
		textStyle(NORMAL);
		text(this.txt, this.r.x + this.r.w / 2, this.r.y + this.r.h / 2);
	}
}

function gridColToX(idx, numCols, colDistance) {
	return lerp(
		INTRINSIC_W / 2 - colDistance * (numCols - 1) / 2,
		INTRINSIC_W / 2 + colDistance * (numCols - 1) / 2,
		idx / (numCols - 1)
	);
}

const BOTTOM_BUTTONS_H = 60;
const BOTTOM_BUTTONS_Y = INTRINSIC_H - BOTTOM_BUTTONS_H / 2;
const IN_GAME_BUTTON_W = 160;

class HomeButton extends TransitionButton {
	constructor(isInGame) {
		super(
			new Rect(
				isInGame ? INTRINSIC_W : INTRINSIC_W / 2,
				INTRINSIC_H,
				isInGame ? IN_GAME_BUTTON_W : 100,
				BOTTOM_BUTTONS_H,
				isInGame ? 'RIGHT' : 'CENTER',
				'BOTTOM'
			),
			() => { SceneManager.fadeToScene(Home); },
			'Home'
		);
	}
}

const DEPTH_1_HOME_BUTTON = new HomeButton(false);
