function Menu() {
    this.draw = function() {
        image(images.openingScene, 0, 0);
        stroke(255);
        strokeWeight(3);
        fill(0);
        textSize(60);
        text("Adventures in Digitopolis", 480, 100);
        textSize(30);
        text("A tale of Captain Zero and Infinitus", 480, 160);
        buttons[0].run();
    }

    this.buttons = [
        new Button(
            "Main Menu",
            420,
            600,
            160,
            60,
            () => { page = "Home"; }
        )
    ]
}
