function Menu() {
    this.bgImage = images.openingScene;

    this.draw = function() {
        stroke(255);
        strokeWeight(3);
        fill(0);
        textSize(60);
        text("Adventures in Digitopolis", INTRINSIC_CENTER_S / 2, 100);
        textSize(30);
        text("A tale of Captain Zero and Infinitus", INTRINSIC_CENTER_S / 2, 160);
        // buttons[0].run();
    };
    
    const BUTTON_LABELS = ['Story Mode', 'Freeplay Mode', 'About'];
    const BUTTON_NEXT_SCENES = [Story, LevelSelection, About];
    const BUTTON_W = 120;
    this.buttons = [];
    for (let i = 0; i < 3; i++) {
        this.buttons.push(new Button(
            BUTTON_LABELS[i],
            INTRINSIC_CENTER_S / 2 - BUTTON_W / 2,
            240 + 120 * i,
            INTRINSIC_CENTER_S,
            80,
            () => { mgr.showScene(BUTTON_NEXT_SCENES[i]); }
        ));
    }
}
