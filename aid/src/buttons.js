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

	get isHovered() {
		return (
			mouseCoordX > this.x &&
			mouseCoordX < this.x + this.w &&
			mouseCoordY > this.y &&
			mouseCoordY < this.y + this.h
		);
	}
}

class Button {
	fade = 0; // 0 = default, 1 = fully faded

	/**
	 * @param {Rect} r: The button's hitbox
	 */
	constructor(r, onClick, fadeRate = 0.1) {
		this.r = r;
		this.onClick = onClick;
		this.fadeRate = fadeRate;
	}

	onHover() {
		cursor(HAND);
		if (mouseIsReleased) this.onClick();
		this.fade = min(this.fade + this.fadeRate, 1);
	}
	onNoHover() {
		this.fade = max(this.fade - this.fadeRate, 0);
	}
	centerText() {
		textAlign(CENTER, CENTER);
		text(this.txt, this.r.x + this.r.w / 2, this.r.y + this.r.h / 2);
	}
	run() {
		if (this.r.isHovered) this.onHover();
		else this.onNoHover();
	}
}

class TransitionButton extends Button {
	constructor(r, onClick, txt) {
		super(r, onClick);
		this.txt = txt;
	}
	
	run() {
		super.run();
		stroke(0);
		strokeWeight(4);
		fill(255 * (1 - this.fade));
		rect(this.r.x, this.r.y, this.r.w, this.r.h, 5);
		fill(255 * this.fade);
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
