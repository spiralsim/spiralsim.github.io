const MAX_EXPLOSION_SIZE = 2000;
const EXPLOSION_RESOLUTION = 100;

var infinitusFade = 0, explosionSize = 0, finishedAnim = false;
var fightProgress = 0;
var explosionProgress = 0;
var endFade = 0;

class End extends Scene {
    draw() {
        background(0);
		imageMode(CENTER);
		// Animation phase 1: Zoom out to infinity
		if (scaleExponent < 1000) {
			scaleExponent *= 1.01;
			for (let i = floor(scaleExponent - 10); i <= scaleExponent; i++)
				drawScaleRing(i, 10 ** (i - scaleExponent) * 600);
			drawCaptainZero(INTRINSIC_W * 3 / 4);
		// Animation phase 3: Infinitus fades in and fights Captain Zero
		} else if (!finishedAnim) {
			drawScaleRing('∞', undefined, 64 * (1 - explosionProgress));
			// Fade in
			if (infinitusFade < 255) {
				infinitusFade += 255 / 180;
				tint(255, infinitusFade);
				drawInfinitus(INTRINSIC_W * 1 / 4, INTRINSIC_H / 2);
				tint(255, 255);
				drawCaptainZero(INTRINSIC_W * 3 / 4, INTRINSIC_H / 2);
			// Characters fly at each other
			} else if (fightProgress < 1) {
				fightProgress += 1 / 60;
				drawInfinitus(INTRINSIC_W * lerp(1 / 4, 1 / 2, fightProgress));
				drawCaptainZero(INTRINSIC_W * lerp(3 / 4, 1 / 2, fightProgress));
			// Explosion
			} else if (explosionProgress < 1) {
				explosionProgress += 1 / 120;
				const explosionSize = MAX_EXPLOSION_SIZE * explosionProgress;
				const alpha = 255 * (1 - explosionProgress) ** 2;
				for (var d = explosionSize; d >= 0; d -= explosionSize / EXPLOSION_RESOLUTION) {
					fill(255, d / explosionSize * 255, 0, alpha);
					circle(INTRINSIC_W / 2, INTRINSIC_H / 2, d);
				}
			} else finishedAnim = true;
		// Animation phase 4: The End
		} else {
			endFade += 255 / 240;
			fill(255, endFade);
			textSize(96);
			text('The End', INTRINSIC_W / 2, 300);
			textSize(48);
			text('Thank you for playing', INTRINSIC_W / 2, 400);
			if (endFade == 255) noLoop();
		}
    }
}
