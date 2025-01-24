var ringX = 360, CZy, gameFade = 255, infinitusFade = 0, fightPos = 240, explosionSize = 0, finishedAnim = false, endFade = 0;

class End extends Scene {
    draw() {
        background(0);
		imageMode(CENTER);
		// Animation phase 1: Make the game elements fade away, make everything currently on the screen align
		if (ringX < 480) {
			gameFade -= 255 / 60;
			imageMode(CORNER);
			tint(255, gameFade);
			image(images.backgrounds[LEVELS.length - 1], 0, 0);
			tint(255, 255);
			ringX += 2;
			imageMode(CENTER);
			CZy = 360 + (CZy - 360) * 0.99;
			image(images.characters[0], 720, CZy, PLAYER_H * CAPTAIN_ZERO_AR, PLAYER_H);
			drawScaleRing(ringX, 360, 600, LEVELS.length);
		// Animation phase 2: Zoom out to infinity
		} else if (playerScale < 1000) {
			playerScale *= 1.01;
			for (let i = floor(playerScale - 10); i <= playerScale; i++) {
				drawScaleRing(ringX, 360, 10 ** (i - playerScale) * 600, i);
			}
			image(images.characters[0], 720, 360, PLAYER_H * CAPTAIN_ZERO_AR, PLAYER_H);
		// Animation phase 3: Infinitus fades in and fights Captain Zero
		} else if (!finishedAnim) {
			if (fightPos) drawScaleRing(ringX, 360, 600, '∞');
			// Fade in
			if (infinitusFade < 255) {
				infinitusFade += 255 / 360;
				tint(255, infinitusFade);
				image(images.characters[1], 240, 360, PLAYER_W, PLAYER_H * INFIN);
				tint(255, 255);
				image(images.characters[0], 720, 360, PLAYER_W, PLAYER_H);
			// Characters fly at each other
			} else if (fightPos) {
				fightPos -= 3;
				image(images.characters[1], 480 - fightPos, 360, PLAYER_H, PLAYER_H * images.INFINITUS_RATIO);
				image(images.characters[0], 480 + fightPos, 360, PLAYER_H * images.CAPTAIN_ZERO_RATIO, PLAYER_H);
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
    }
}
