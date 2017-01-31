var PointType = PIXI.Point;
var ArmatureDisplayType = dragonBones.PixiArmatureDisplay;
var EventType = dragonBones.EventObject;
var Bone = dragonBones.Bone;
var Main = (function () {
    function Main() {
        this._renderer = new PIXI.WebGLRenderer(250, 250, { backgroundColor: 0xffffff });
        this._stage = new PIXI.Container();
        this._backgroud = new PIXI.Sprite(PIXI.Texture.EMPTY);
        this._data = null;
        this._armatureDisplay = null;
        this._dragging = false;
    }
    Main.prototype.init = function () {
        document.body.appendChild(this._renderer.view);
        this._stage.addChild(this._backgroud);
        this._backgroud.width = this._renderer.width;
        this._backgroud.height = this._renderer.height;
        PIXI.ticker.shared.add(this._renderHandler, this);
        PIXI.loader.add("dragonBonesData", "./resources/art_ske.json");
        PIXI.loader.add("textureDataA", "./resources/art_tex.json");
        PIXI.loader.add("textureA", "./resources/art_tex.png");
        PIXI.loader.once("complete", this._loadCompleteHandler, this);
        PIXI.loader.load();
    };
    Main.prototype._loadCompleteHandler = function (loader, object) {
        dragonBones.PixiFactory.factory.parseDragonBonesData(object["dragonBonesData"].data);
        dragonBones.PixiFactory.factory.parseTextureAtlasData(object["textureDataA"].data, object["textureA"].texture);
        this._stage.interactive = true;
        var armature = dragonBones.PixiFactory.factory.buildArmature("shipball");
        var armatureDisplay = armature.display;
        armatureDisplay.x = this._renderer.width * .5;
        armatureDisplay.y = this._renderer.height * .5;
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
        // armatureDisplay.x = this._renderer.width * .5;
        // armatureDisplay.y = this._renderer.height * .5;
        // armature.animation.play("newAnimation");
        armatureDisplay.interactive = true;
        armatureDisplay.buttonMode = true;
        armatureDisplay.on('pointerdown', this.onDragStart, this);
        armatureDisplay.on('pointerup', this.onDragEnd, this);
        armatureDisplay.on('pointerupoutside', this.onDragEnd, this);
        armatureDisplay.on('pointermove', this.onDragMove, this);
        //var interactionManager:PIXI.interaction.InteractionManager = new PIXI.interaction.InteractionManager(this._renderer);
        dragonBones.WorldClock.clock.add(armature);
        this._stage.addChild(armatureDisplay);
        this._armatureDisplay = armatureDisplay;
    };
    Main.prototype.onDragStart = function (event) {
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch
        this._data = event.data;
        this._data.alpha = 0.5;
        this._dragging = true;
        var newPosition = this._data.getLocalPosition(this._armatureDisplay.parent);
        this._armatureDisplay.x = newPosition.x;
        this._armatureDisplay.y = newPosition.y + this._armatureDisplay.height * 0.5;
    };
    Main.prototype.onDragEnd = function () {
        this._data.alpha = 1;
        this._dragging = false;
        // set the interaction data to null
        this._data = null;
        this._armatureDisplay.x = this._renderer.width * .5;
        this._armatureDisplay.y = this._renderer.height * .5;
    };
    Main.prototype.onDragMove = function () {
        if (this._dragging) {
            var newPosition = this._data.getLocalPosition(this._stage);
            this._armatureDisplay.x = newPosition.x;
            this._armatureDisplay.y = newPosition.y + this._armatureDisplay.height * 0.5;
        }
    };
    Main.prototype._animationEventHandler = function (event) {
        console.log(event.type, event.name, event.animationState.name);
    };
    Main.prototype._renderHandler = function (deltaTime) {
        dragonBones.WorldClock.clock.advanceTime(-1);
        this._renderer.render(this._stage);
    };
    return Main;
}());
;
var main = new Main();
main.init();
//# sourceMappingURL=Main.js.map