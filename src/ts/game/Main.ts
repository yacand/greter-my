import PointType = PIXI.Point;
import ArmatureDisplayType = dragonBones.PixiArmatureDisplay;
import EventType = dragonBones.EventObject;
import Bone = dragonBones.Bone;

class Main
{
    private renderer = new PIXI.WebGLRenderer(250, 250, {backgroundColor:0xffffff});
    private stage = new PIXI.Container();
    private _backgroud:PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);

    constructor()
    {
    }

    public init():void
    {
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
    }

    private _loadComplateHandler(loader:PIXI.loaders.Loader, object:dragonBones.Map<PIXI.loaders.Resource>):void
    {
        dragonBones.PixiFactory.factory.parseDragonBonesData(object["dragonBonesData"].data);
        dragonBones.PixiFactory.factory.parseTextureAtlasData(object["textureDataA"].data, object["textureA"].texture);
        this.stage.interactive = true;
        var armature = dragonBones.PixiFactory.factory.buildArmature("shipball");
        var armatureDisplay = <ArmatureDisplayType>armature.display;
        armatureDisplay.x = this.renderer.width * .5;
        armatureDisplay.y = this.renderer.height * .5;
        armature.addEventListener(dragonBones.EventObject.START, this._animationEventHandler, this);
        armature.addEventListener(dragonBones.EventObject.FRAME_EVENT, this._animationEventHandler, this);
        armature.animation.play("ship-anim-1");
        //armature.animation.play("ship-anim-2");
        armature.animation.timeScale = 1;
        //armature.animation.fadeIn("ship-anim-2", 2, 2);
        //armature.animation.timeScale = 0.1;
        var bones:Array<Bone> = armature.getBones();
        var bone:Bone = armature.getBone("boneBall");
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
    }

    private _touchHandler(event:PIXI.interaction.InteractionEvent):void
    {
        console.log(event.type);
    }

    private _animationEventHandler(event: EventType): void {
        console.log(event.type, event.name, event.animationState.name);
    }

    private _renderHandler(deltaTime: number): void {
        dragonBones.WorldClock.clock.advanceTime(-1);
        this.renderer.render(this.stage);
    }
};

var main = new Main();
main.init();
