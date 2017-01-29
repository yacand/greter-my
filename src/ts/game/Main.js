var PointType = PIXI.Point;
var ArmatureDisplayType = dragonBones.PixiArmatureDisplay;
var EventType = dragonBones.EventObject;
var Bone = dragonBones.Bone;
var Main = (function () {
    function Main() {
        this.renderer = new PIXI.WebGLRenderer(250, 250, { backgroundColor: 0xffffff });
        this.stage = new PIXI.Container();
        this._backgroud = new PIXI.Sprite(PIXI.Texture.EMPTY);
    }
    Main.prototype.init = function () {
        document.body.appendChild(this.renderer.view);
        this.stage.addChild(this._backgroud);
        this._backgroud.width = this.renderer.width;
        this._backgroud.height = this.renderer.height;
        PIXI.ticker.shared.add(this._renderHandler, this);
        PIXI.loader.add("dragonBonesData", "./resources/art_ske.json");
        PIXI.loader.add("textureDataA", "./resources/art_tex.json");
        PIXI.loader.add("textureA", "./resources/art_tex.png");
        PIXI.loader.once("complete", this._loadComplateHandler, this);
        PIXI.loader.load();
    };
    Main.prototype._loadComplateHandler = function (loader, object) {
        dragonBones.PixiFactory.factory.parseDragonBonesData(object["dragonBonesData"].data);
        dragonBones.PixiFactory.factory.parseTextureAtlasData(object["textureDataA"].data, object["textureA"].texture);
        this.stage.interactive = true;
        var armature = dragonBones.PixiFactory.factory.buildArmature("shipball");
        var armatureDisplay = armature.display;
        armatureDisplay.x = this.renderer.width * .5;
        armatureDisplay.y = this.renderer.height * .5;
        armature.addEventListener(dragonBones.EventObject.START, this._animationEventHandler, this);
        armature.addEventListener(dragonBones.EventObject.FRAME_EVENT, this._animationEventHandler, this);
        armature.animation.play("ship-anim-1");
        //armature.animation.play("ship-anim-2");
        armature.animation.timeScale = 1;
        //armature.animation.fadeIn("ship-anim-2", 2, 2);
        //armature.animation.timeScale = 0.1;
        var bones = armature.getBones();
        var bone = armature.getBone("boneBall");
        //bone.visible = false;
        // var armature = dragonBones.PixiFactory.factory.buildArmature("armature");
        // var armatureDisplay = <ArmatureDisplayType>armature.display;
        // armatureDisplay.x = this.renderer.width * .5;
        // armatureDisplay.y = this.renderer.height * .5;
        // armature.animation.play("newAnimation");
        armatureDisplay.interactive = true;
        armatureDisplay.buttonMode = true;
        //armatureDisplay.on('click', this._touchHandler, this);
        armatureDisplay.on('pointerdown', this._touchHandler, this);
        //var interactionManager:PIXI.interaction.InteractionManager = new PIXI.interaction.InteractionManager(this.renderer);
        // this.stage.on('touchstart', this._touchHandler, this);
        // this.stage.on('touchend', this._touchHandler, this);
        // this.stage.on('touchmove', this._touchHandler, this);
        // this.stage.on('keydown', this._touchHandler, this);
        // this.stage.on('keyup', this._touchHandler, this);
        // this.stage.on('mousedown', this._touchHandler, this);
        // this.stage.on('click', this._touchHandler, this);
        dragonBones.WorldClock.clock.add(armature);
        this.stage.addChild(armatureDisplay);
    };
    Main.prototype._touchHandler = function (event) {
        console.log(event.type);
    };
    Main.prototype._animationEventHandler = function (event) {
        console.log(event.type, event.name, event.animationState.name);
    };
    Main.prototype._renderHandler = function (deltaTime) {
        dragonBones.WorldClock.clock.advanceTime(-1);
        this.renderer.render(this.stage);
    };
    return Main;
}());
;
var main = new Main();
main.init();
//# sourceMappingURL=main.js.map