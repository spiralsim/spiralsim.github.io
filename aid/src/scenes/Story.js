class Story extends Depth1Scene {
    static page = 1;

    constructor() {
        super();
        this.buttons.push(new Button(
            '←',
            0,
            BOTTOM_BUTTONS_Y,
            60,
            BOTTOM_BUTTONS_H,
            () => { Story.page = max(Story.page - 1, 1); }
        ));
        this.buttons.push(new Button(
            '→',
            60,
            BOTTOM_BUTTONS_Y,
            60,
            BOTTOM_BUTTONS_H,
            () => {
                if (Story.page < 6) Story.page++;
                else SceneManager.fadeToScene(Game, 1);
            }
        ));
        this.buttons.push(new Button(
            'Skip to Game',
            INTRINSIC_W,
            BOTTOM_BUTTONS_Y,
            180,
            BOTTOM_BUTTONS_H,
            () => { SceneManager.fadeToScene(Game, 1); },
            'RIGHT'
        ));
    }

    draw() {
        fill(0);
        textSize(30);
        if ([1, 6].includes(Story.page)) {
            textStyle(ITALIC);
            textAlign(CENTER, CENTER);
            textSize(36);
            imageMode(CENTER);
            rectMode(CENTER);
        } else {
            textAlign(LEFT, TOP);
            imageMode(CORNER);
            textSize(18);
        }

        noStroke();
        switch (Story.page) {
            case 1:
                text(`Our story begins with Milo's adventures in the Kingdom of Digitopolis, ruled by the Mathemagician and hidden away in the vast Lands Beyond...`, INTRINSIC_W / 2, 240, INTRINSIC_W);
                textSize(24);
                text(`Excerpted from "Childcraft: The How and Why Library", Volume 13 (©1985), p. 93–113`, INTRINSIC_W / 2, 390, INTRINSIC_W);
                break;
            case 2:
                text(`"Can you show me the biggest number there is?" asked Milo.

"I'd be delighted," replied the Mathemagician, opening one of the closet doors. "We keep it right here. It took four miners just to dig it out."

Inside was the biggest`, 0, 40, INTRINSIC_W);
                image(images.storyline[0], 0, 180, 318, 304);
                text(`Milo had ever seen. It was fully twice as high as the Mathemagician.`, 0, 500, INTRINSIC_W);
                break;
            case 3:
                text(`"No, that's not what I mean," objected Milo. "Can you show me the longest number there is?"

"Surely," said the Mathemagician, opening another door. "Here it is. It took three carts to carry it here."

Inside this closest was the longest`, 0, 40, INTRINSIC_W);
                image(images.storyline[1], 0, 150, 620, 320);
                text(`imaginable. It was just about as wide as the three was high.`, 0, 470, INTRINSIC_W);
                break;
            case 4:
                text(`"No, no, no, that's not what I mean either," he said, looking helplessly at Tock.

"I think what you would like to see," said the dog, scratching himself just under half-past four, "is the number of greatest possible magnitude."

"Well, why didn't you say so?" said the Mathemagician, who was busily measuring the edge of a raindrop.

...

"Just follow that line forever," said the Mathemagician, "and when you reach the end, turn left. There you'll find the land of Infinity, where the tallest, the shortest, the biggest, the smallest, and the most and the least of everything are kept.

..."`, 0, 40, INTRINSIC_W);
                break;
            case 5:
                text(`Milo bounded across the room and started up the stairs two at a time. "Wait for me, please," he shouted to Tock and the Humbug. "I'll be gone just a few minutes."`, 0, 40, INTRINSIC_W - 216);
                image(images.storyline[2], INTRINSIC_W - 192, 40, 192, 544);
                break;
            case 6:
                text(`Of course, Milo could never reach Infinity, for he is only a mortal.

But you are no mere mortal. You are Captain Zero; it is your destiny to meet the immortal Infinitus.`, INTRINSIC_W / 2, 180, INTRINSIC_W);
                image(images.characters[0], INTRINSIC_W / 2, INTRINSIC_H * 0.6);
                break;
        }
        rectMode(CORNER);
    }
}
