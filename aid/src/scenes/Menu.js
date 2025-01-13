function Menu() {
    this.bgImage = images.openingScene;

    this.draw = function() {
        stroke(255);
        strokeWeight(3);
        fill(0);
        textSize(60);
        text("Adventures in Digitopolis", width / 2, 100);
        textSize(30);
        text("A tale of Captain Zero and Infinitus", width / 2, 160);
        // buttons[0].run();
    };

    // this.buttons = [
    //     new Button(
    //         "Main Menu",
    //         420,
    //         600,
    //         160,
    //         60,
    //         () => { mgr.showScene() }
    //     )
    // ];
}
