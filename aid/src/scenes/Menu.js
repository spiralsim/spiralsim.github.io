function Menu() {
    this.background = images.openingScene;

    this.draw = function() {
        stroke(255);
        strokeWeight(3);
        fill(0);
        textSize(60);
        text("Adventures in Digitopolis", INTRINSIC_MAIN_S / 2, 100);
        textSize(30);
        text("A tale of Captain Zero and Infinitus", INTRINSIC_MAIN_S / 2, 160);
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
            () => { mgr.showScene(BUTTON_NEXT_SCENES[i]); }
        ));
    }
}
