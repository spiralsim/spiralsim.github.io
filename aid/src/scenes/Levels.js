function Levels() {
    this.draw = function() {
        noStroke();
        fill(0);
        textSize(60);
        text('Select Level', INTRINSIC_W / 2, 80);
    };

    this.buttons = [homeButton];
    // Lays out level buttons in 2 rows of 4 buttons
    const R = 2, C = 4;
    const LEVEL_BUTTON_S = 80;
    const LEVEL_BUTTON_DISTANCE = 120; // Between centers of buttons
    for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) {
            const levelNum = r * C + c + 1;
            this.buttons.push(new Button(
                '' + levelNum,
                lerp(
                    INTRINSIC_W / 2 - LEVEL_BUTTON_DISTANCE * (C - 1) / 2,
                    INTRINSIC_W / 2 + LEVEL_BUTTON_DISTANCE * (C - 1) / 2,
                    c / (C - 1)
                ),
                lerp(
                    INTRINSIC_H / 2 - LEVEL_BUTTON_DISTANCE * (R - 1) / 2,
                    INTRINSIC_H / 2 + LEVEL_BUTTON_DISTANCE * (R - 1) / 2,
                    r / (R - 1)
                ),
                LEVEL_BUTTON_S,
                LEVEL_BUTTON_S,
                () => sceneManager.showScene(levelNum),
                'CENTER'
            ));
        }
    }
}
