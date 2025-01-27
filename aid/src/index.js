var canvas, images = {
	openingScene: null,
	storyline: [],
	backgrounds: [],
	characters: [],
	entities: []
};
const CAPTAIN_ZERO_ORIGINAL_DIMENSIONS = [158, 256];
const INFINITUS_ORIGINAL_DIMENSIONS = [256, 111];
const INTRINSIC_W = 960, INTRINSIC_H = 720; // Dimensions of content before scaling
const ASSET_PATH = 'images';
const MAIN_FONT_NAME = 'Georgia', ITEM_FONT_NAME = 'Metamorphous';

/**
 * Loads images
 */
function preload() {
	images.openingScene = loadImage(`${ASSET_PATH}/opening-scene.png`);
	for (let i = 1; i <= 3; i++) images.storyline.push(loadImage(`${ASSET_PATH}/storyline/story${i}.png`));
	for (let i = 1; i <= LEVELS_DATA.length; i++) images.backgrounds.push(loadImage(`${ASSET_PATH}/backgrounds/${i}.png`));
	['CaptainZero', 'Infinitus'].forEach(n => 
		images.characters.push(loadImage(`${ASSET_PATH}/characters/${n}.png`)));
	['FillerArrow', 'CannonArrow'].forEach(n =>
		images.entities.push(loadImage(`${ASSET_PATH}/entities/${n}.png`)));
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent('body');
	
	SceneManager.fadeToScene(Home);
	SceneManager.wire();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}
