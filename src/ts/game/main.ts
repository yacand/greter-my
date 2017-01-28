type PointType = PIXI.Point;
type ArmatureDisplayType = dragonBones.PixiArmatureDisplay;
type EventType = dragonBones.EventObject;

class Greeter {
    private renderer = new PIXI.WebGLRenderer(250, 250, { backgroundColor: 0xffffff });
    private stage = new PIXI.Container();
    private _backgroud: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);

    constructor() { }

    public init():void {
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
    }

    private _loadComplateHandler(loader: PIXI.loaders.Loader, object: dragonBones.Map<PIXI.loaders.Resource>): void {
        dragonBones.PixiFactory.factory.parseDragonBonesData(object["dragonBonesData"].data);
        dragonBones.PixiFactory.factory.parseTextureAtlasData(object["textureDataA"].data, object["textureA"].texture);

        this.stage.interactive = true;

        var armature = dragonBones.PixiFactory.factory.buildArmature("ship");
        var armatureDisplay = <ArmatureDisplayType>armature.display;
        armatureDisplay.x = this.renderer.width * .5;
        armatureDisplay.y = this.renderer.height * .5;
        armature.addEventListener(dragonBones.EventObject.START, this._animationEventHandler, this);
        //armature.animation.play("ship-anim-1");
        armature.animation.play("ship-anim-2");
        //armature.animation.fadeIn("ship-anim-2", 2, 2);
        //armature.animation.timeScale = 0.1;

        // var armature = dragonBones.PixiFactory.factory.buildArmature("armature");
        // var armatureDisplay = <ArmatureDisplayType>armature.display;
        // armatureDisplay.x = this.renderer.width * .5;
        // armatureDisplay.y = this.renderer.height * .5;
        // armature.animation.play("newAnimation");



        dragonBones.WorldClock.clock.add(armature);
        this.stage.addChild(armatureDisplay);
    }

    private _animationEventHandler(event: EventType): void {
        console.log(event.animationState.name, event.type);
    }

    private _renderHandler(deltaTime: number): void {
        dragonBones.WorldClock.clock.advanceTime(-1);
        this.renderer.render(this.stage);
    }
};

var greeter = new Greeter();
greeter.init();
