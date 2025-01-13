function About() {
    this.draw = function() {
        noStroke();
        fill(0);
        textSize(60);
        text("About", INTRINSIC_MAIN_S / 2, 80);
        textSize(30);
        textAlign(LEFT);
        text(`This was originally made for a 10th grade math class that my teacher called "Analysis I" (equivalent to AP Calc BC but harder). We had a project where we were supposed to make a creative interpretation of L'Hopital's Rule (zero versus infinity, a battle he called Captain Zero versus Infinitus).

Included in the source code of this game are my intended solutions.

All level background images are freely available. You can find links to them in the source code.`, 0, 100, INTRINSIC_MAIN_S);
    };

    this.buttons = [homeButton];
}
