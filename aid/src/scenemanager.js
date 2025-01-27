//
// Adapted from p5.SceneManager
// https://github.com/mveteanu/p5.SceneManager
// Licensed under CC BY 2.0
// https://creativecommons.org/licenses/by/2.0/
// 

var mouseCoordX, mouseCoordY; // The coordinates of the mouse mapped to the main square
var pMouseIsPressed, mouseIsReleased; // mouseIsClicked stores whether the mouse was released in this frame

const MAIN_MARGIN = 20; // Minimum margin between main content and canvas
const SCENE_FADE_RATE = 25;

class SceneManager {
    static scenes = [];
    static scene = null;
    static nextScene = null;
    static nextSceneArgs = null;
    static fade = 0;
    static fadeDelta;

    // Wire relevant p5.js events, except setup()
    // If you don't call this method, you need to manually wire events
    static wire() {
        const P5Events = ["mouseClicked",
            "mousePressed",
            "mouseReleased",
            "mouseMoved",
            "mouseDragged",
            "doubleClicked",
            "mouseWheel",
            "keyPressed",
            "keyReleased",
            "keyTyped",
            "touchStarted",
            "touchMoved",
            "touchEnded",
            "deviceMoved",
            "deviceTurned",
            "deviceShaken"];
        
        // Wire draw manually for speed reasons...
        window.draw = SceneManager.draw;

        // This loop will wire automatically all P5 events to each scene like this:
        // o.mouseClicked = function() { me.handleEvent("mouseClicked"); }
        for (var i = 0; i < P5Events.length; i++) {
            let sEvent = P5Events[i]; // let is necesary to set the scope at the level of for
            window[sEvent] = function () { SceneManager.handleEvent(sEvent); };
        }
    }

    static addScene(sceneClass) {
        const scene = new sceneClass();
        SceneManager.scenes.push(scene);
        return scene;
    }

    static findScene(sceneClass) {
        return SceneManager.scenes.find(s => s instanceof sceneClass);
    }

    // Show a scene based on the function name
    // Optionally you can send arguments to the scene
    // Arguments will be retrieved in the scene via .sceneArgs property
    static fadeToScene(sceneClass, sceneArgs) {
        if (SceneManager.nextScene) return; // Prevents restarting fades in the middle of a fade
        SceneManager.nextScene = SceneManager.findScene(sceneClass) ?? SceneManager.addScene(sceneClass);
        SceneManager.nextSceneArgs = sceneArgs;
        SceneManager.fade = 0;
        SceneManager.fadeDelta = SCENE_FADE_RATE;
    }

    static reenter() {
        SceneManager.scene.enter();
    }

    // This is the SceneManager .draw() method
    // This will dispatch the main draw() to the 
    // current scene draw() method
    static draw() {
        const scene = SceneManager.scene;
        if (scene) {
            const bg = scene.background;
            // Uses the minimum scale factor for the background that fills the canvas
            background('white');
            if (bg instanceof p5.Image) {
                if (scene.hasTintedBackground) tint(255, 64);
                image(bg, 0, 0, width, height, 0, 0, bg.width, bg.height, COVER);
                noTint();
            }
            // else background(bg ?? 192);
            // Uses the maximum scale factor for the main content that fits on the canvas,
            // leaving at least MAIN_MARGIN of space on each border
            const mainScaleFactor = min(
                (width - MAIN_MARGIN * 2) / INTRINSIC_W,
                (height - MAIN_MARGIN * 2) / INTRINSIC_H
            );
            const scaledW = INTRINSIC_W * mainScaleFactor;
            const scaledH = INTRINSIC_H * mainScaleFactor;
            // Top-left corner's coordinates
            const extrinsicMainX = (width - scaledW) / 2;
            const extrinsicMainY = (height - scaledH) / 2;
            mouseCoordX = (mouseX - extrinsicMainX) / mainScaleFactor;
            mouseCoordY = (mouseY - extrinsicMainY) / mainScaleFactor;
            push();
            translate(extrinsicMainX, extrinsicMainY);
            scale(mainScaleFactor);
            stroke(255, 0, 0);
            noFill();
            rect(0, 0, INTRINSIC_W, INTRINSIC_H);
            textFont("Georgia");
            textAlign(CENTER);
            cursor(ARROW);
            fill(0);
            noStroke();
            scene.draw();
            if (scene.buttons) scene.buttons.forEach(b => b.run());
            pop();
        } else background('black');
        
        if (SceneManager.nextScene) {
            if (SceneManager.fade >= 255) {
                SceneManager.scene = SceneManager.nextScene;
                SceneManager.scene.enter(SceneManager.nextSceneArgs);
                SceneManager.nextScene = null;
            } else SceneManager.fade += SCENE_FADE_RATE;
        } else if (SceneManager.fade > 0) SceneManager.fade -= SCENE_FADE_RATE;
        background(SceneManager.nextScene instanceof End ? 0 : 255, SceneManager.fade);

        mouseIsReleased = !mouseIsPressed && pMouseIsPressed;
        pMouseIsPressed = mouseIsPressed;
    }

    // Handle a certain event for a scene... 
    // It is used by the anonymous functions from the wire() function
    static handleEvent(sEvent) {
        if (SceneManager.scene == null || SceneManager.scene.oScene == null)
            return;

        var fnSceneEvent = SceneManager.scene.oScene[sEvent];
        if (fnSceneEvent)
            fnSceneEvent.call(SceneManager.scene.oScene);
    }
}
