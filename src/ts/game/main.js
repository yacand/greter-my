var Greeter = (function () {
    function Greeter() {
        this.renderer = new PIXI.WebGLRenderer(250, 250, { backgroundColor: 0xffffff });
        this.stage = new PIXI.Container();
        this._backgroud = new PIXI.Sprite(PIXI.Texture.EMPTY);
    }
    Greeter.prototype.init = function () {
        document.body.appendChild(this.renderer.view);
        this.stage.addChild(this._backgroud);
        this._backgroud.width = this.renderer.width;
        this._backgroud.height = this.renderer.height;
        PIXI.ticker.shared.add(this._renderHandler, this);
        PIXI.loader.add("dragonBonesData", "./resources/greter_ske.json");
        PIXI.loader.add("textureDataA", "./resources/greter_tex.json");
        PIXI.loader.add("textureA", "./resources/greter_tex.png");
        PIXI.loader.once("complete", this._loadComplateHandler, this);
        PIXI.loader.load();
    };
    Greeter.prototype._loadComplateHandler = function (loader, object) {
        dragonBones.PixiFactory.factory.parseDragonBonesData(object["dragonBonesData"].data);
        dragonBones.PixiFactory.factory.parseTextureAtlasData(object["textureDataA"].data, object["textureA"].texture);
        this.stage.interactive = true;
        var armature = dragonBones.PixiFactory.factory.buildArmature("ship");
        var armatureDisplay = armature.display;
        armatureDisplay.x = this.renderer.width * .5;
        armatureDisplay.y = this.renderer.height * .5;
        armature.addEventListener(dragonBones.EventObject.START, this._animationEventHandler, this);
        //armature.animation.play("ship-anim-1");
        armature.animation.play("ship-anim-2");
        armature.animation.timeScale = 1;
        //armature.animation.fadeIn("ship-anim-2", 2, 2);
        //armature.animation.timeScale = 0.1;
        // var armature = dragonBones.PixiFactory.factory.buildArmature("armature");
        // var armatureDisplay = <ArmatureDisplayType>armature.display;
        // armatureDisplay.x = this.renderer.width * .5;
        // armatureDisplay.y = this.renderer.height * .5;
        // armature.animation.play("newAnimation");
        dragonBones.WorldClock.clock.add(armature);
        this.stage.addChild(armatureDisplay);
    };
    Greeter.prototype._animationEventHandler = function (event) {
        console.log(event.animationState.name, event.type);
    };
    Greeter.prototype._renderHandler = function (deltaTime) {
        dragonBones.WorldClock.clock.advanceTime(-1);
        this.renderer.render(this.stage);
    };
    return Greeter;
}());
;
var greeter = new Greeter();
greeter.init();
//# sourceMappingURL=main.js.map