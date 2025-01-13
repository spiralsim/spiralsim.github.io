function Story() {
    var storyPage = 1;

    this.draw = function() {
        this.background = storyPage >= 5 ? 192 : 255;
        fill(0);
        textSize(30);
        if ('16'.includes(storyPage)) {
            textAlign(CENTER, CENTER);
            textStyle(ITALIC);
            textSize(36);
        } else {
            textAlign(LEFT, TOP);
            textSize(24);
        }
        
        switch (storyPage) {
            case 1:
                tint(255, 25);
                image(images.openingScene, 0, 0);
                tint(255, 255);
                textAlign(CENTER, CENTER);
                rectMode(CENTER);
                text(`Our story begins with Milo's adventures in the Kingdom of Digitopolis, ruled by the Mathemagician and hidden away in the vast Lands Beyond...`, 480, 240, 600);
                textSize(24);
                text(`Excerpted from "Childcraft: The How and Why Library",\nVolume 13 (©1985), p. 93–113`, 480, 390);
                rectMode(CORNER);
                
                break;
            case 2:
                text(`\t"Can you show me the biggest number there is?" asked Milo.
\t"I'd be delighted," replied the Mathemagician, opening one of the closet doors. "We keep it right here. It took four miners just to dig it out."
\tInside was the biggest











Milo had ever seen. It was fully twice as high as the Mathemagician.`, 80, 80, 800);
                image(images.storyline[0], 80, 200, 318, 304);
                break;
            case 3:
                text(`	"No, that's not what I mean," objected Milo. "Can you show me the longest number there is?"
"Surely," said the Mathemagician, opening another door. "Here it is. It took three carts to carry it here."
Inside this closest was the longest











imaginable. It was just about as wide as the three was high.`, 80, 80, 800);
                image(images.storyline[1], 80, 220, 640, 320);
                break;
            case 4:
                text(`	"No, no, no, that's not what I mean either," he said, looking helplessly at Tock.
"I think what you would like to see," said the dog, scratching himself just under half-past four, "is the number of greatest possible magnitude."
"Well, why didn't you say so?" said the Mathemagician, who was busily measuring the edge of a raindrop.
...
"Just follow that line forever," said the Mathemagician, "and when you reach the end, turn left. There you'll find the land of Infinity, where the tallest, the shortest, the biggest, the smallest, and the most and the least of everything are kept."`, 80, 80, 800);
                break;
            case 5:
                text(`...
Milo bounded across the room and started up the stairs two at a time. "Wait for me, please," he shouted to Tock and the Humbug. "I'll be gone just a few minutes."`, 80, 80, 600);
                image(images.storyline[2], 708, 30, 192, 544);
                break;
            case 6:
                text(`Of course, Milo could never reach Infinity, for he is only a mortal.
But you are no mere mortal. You are Captain Zero; it is your destiny to meet the immortal Infinitus.`, 120, 180, 720);
                image(images.characters[0], 480 - (180 * images.CAPTAIN_ZERO_RATIO) / 2, 360, 180 * images.CAPTAIN_ZERO_RATIO, 180);
                break;
            default:
                mgr.showScene(Game);
        }
    };

    this.buttons = [
        homeButton,
        new Button(
            '←',
            390,
            630,
            60,
            60,
            () => { storyPage = max(storyPage - 1, 1); }
        ),
        new Button(
            '→',
            450,
            630,
            60,
            60,
            () => { storyPage++; }
        ),
        new Button(
            'Skip to Game',
            540,
            630,
            180,
            60,
            () => { storyPage = 7; }
        )
    ];
}
