var canvas, images = {
	openingScene: null,
	storyline: [],
	backgrounds: [],
	characters: [],
	entities: [],
	CAPTAIN_ZERO_RATIO: 158 / 256, // ratio of captain zero's width to height
	INFINITUS_RATIO: 112 / 256 // ratio of infinitus' height to width
};
const DIMENSIONS = [960, 720];
const ASSET_PATH = 'images';

/**
 * Loads images
 */
function preload() {
	const LEVELS = loadJSON('levels.json');
	images.openingScene = loadImage(`${ASSET_PATH}/opening-scene.png`);
	for (let i = 1; i <= 3; i++) images.storyline.push(loadImage(`${ASSET_PATH}/storyline/story${i}.png`));
	for (let i = 1; i <= LEVELS.length; i++) images.backgrounds.push(loadImage(`${ASSET_PATH}/backgrounds/${i}.png`));
	['CaptainZero', 'Infinitus'].forEach(n => 
		images.characters.push(loadImage(`${ASSET_PATH}/characters/${n}.png`)));
	['FillerArrow', 'CannonArrow'].forEach(n =>
		images.entities.push(loadImage(`${ASSET_PATH}/entities/${n}.png`)));
	document.getElementById('loading-message').remove();
}

function setup() {
    canvas = createCanvas(DIMENSIONS[0], DIMENSIONS[1]);
	canvas.parent('processingCanvas');
	document.getElementsByTagName('body')[0].setAttribute('style', 'background-color: black');

    var mgr = new SceneManager();
    // mgr.bkImage = bkImage; // inject bkImage property
    mgr.wire();
    mgr.showScene(Menu);
}
