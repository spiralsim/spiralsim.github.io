class Home extends Scene {
    constructor() {
        super();
        const BUTTON_LABELS = ['Story Mode', 'Freeplay Mode', 'About'];
        const BUTTON_NEXT_SCENES = [Story, Levels, About];
        this.buttons = [];
        for (let i = 0; i < 3; i++) {
            this.buttons.push(new TransitionButton(
                new Rect(
                    INTRINSIC_W / 2,
                    INTRINSIC_H * (0.4 + 0.2 * i),
                    INTRINSIC_W * 3 / 4,
                    INTRINSIC_H * 0.15,
                    'CENTER',
                    'CENTER'
                ),
                () => { SceneManager.fadeToScene(BUTTON_NEXT_SCENES[i]); },
                BUTTON_LABELS[i]
            ));
        }
    }

    draw() {
        textSize(60);
        text('Adventures in Digitopolis', INTRINSIC_W / 2, 100);
        textSize(30);
        text('A tale of Captain Zero and Infinitus', INTRINSIC_W / 2, 160);
    }
}
