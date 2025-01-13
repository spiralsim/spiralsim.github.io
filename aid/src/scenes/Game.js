function Game() {
    this.draw = function() {
		this.background = 128;
        stroke(255);
        strokeWeight(3);
        fill(0);
        textSize(60);
        text('Game placeholder', INTRINSIC_MAIN_S / 2, 100);
    };
    
    const BUTTON_LABELS = ['Story Mode', 'Freeplay Mode', 'About'];
    const BUTTON_NEXT_SCENES = [Story, LevelSelection, About];
    const BUTTON_W = 480;
    this.buttons = [];
    for (let i = 0; i < 3; i++) {
        this.buttons.push(new Button(
            BUTTON_LABELS[i],
            INTRINSIC_MAIN_S / 2 - BUTTON_W / 2,
            240 + 120 * i,
            BUTTON_W,
            80,
            () => { sceneManager.showScene(BUTTON_NEXT_SCENES[i]); }
        ));
    }
}
