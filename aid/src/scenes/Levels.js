class Levels extends Depth1Scene {
    constructor() {
        super();
        // Lays out level buttons in 2 rows of 4 buttons
        const R = 2, C = 4;
        const LEVEL_BUTTON_S = 80;
        const LEVEL_BUTTON_DISTANCE = 120; // Between centers of buttons
        for (let r = 0; r < R; r++) {
            for (let c = 0; c < C; c++) {
                const levelNum = r * C + c + 1;
                this.buttons.push(new TransitionButton(
                    new Rect(
                        gridColToX(c, C, LEVEL_BUTTON_DISTANCE),
                        lerp(
                            INTRINSIC_H / 2 - LEVEL_BUTTON_DISTANCE * (R - 1) / 2,
                            INTRINSIC_H / 2 + LEVEL_BUTTON_DISTANCE * (R - 1) / 2,
                            r / (R - 1)
                        ),
                        LEVEL_BUTTON_S,
                        LEVEL_BUTTON_S,
                        'CENTER',
                        'CENTER'
                    ),
                    () => { SceneManager.fadeToScene(Game, levelNum); },
                    '' + levelNum
                ));
            }
        }
    }

    draw() {
        noStroke();
        fill(0);
        textSize(60);
        text('Select Level', INTRINSIC_W / 2, 80);
    }
}
