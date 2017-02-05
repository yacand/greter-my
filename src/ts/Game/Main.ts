import PointType = PIXI.Point;
import InteractionEvent = PIXI.interaction.InteractionEvent;
import ArmatureDisplayType = dragonBones.PixiArmatureDisplay;
import EventType = dragonBones.EventObject;
import Bone = dragonBones.Bone;


class Main
{
    private _renderer = new PIXI.WebGLRenderer(250, 250, {backgroundColor:0xffffff});
    private _stage = new PIXI.Container();

    private _backgroud:PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);


    private _data:any = null;
    private _armatureDisplay:ArmatureDisplayType = null;
    private _dragging:boolean = false;

    constructor()
    {
    }

    public init():void
    {
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
    }

    private _loadCompleteHandler(loader:PIXI.loaders.Loader, object:dragonBones.Map<PIXI.loaders.Resource>):void
    {
        dragonBones.PixiFactory.factory.parseDragonBonesData(object["dragonBonesData"].data);
        dragonBones.PixiFactory.factory.parseTextureAtlasData(object["textureDataA"].data, object["textureA"].texture);
        this._stage.interactive = true;
        var armature = dragonBones.PixiFactory.factory.buildArmature("shipball");
        var armatureDisplay = <ArmatureDisplayType>armature.display;
        armatureDisplay.x = this._renderer.width * .5;
        armatureDisplay.y = this._renderer.height * .5;
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
    }

    private onDragStart(event:InteractionEvent)
    {
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch

        this._data = event.data;
        this._data.alpha = 0.5;
        this._dragging = true;

        var newPosition = this._data.getLocalPosition(this._armatureDisplay.parent);
        this._armatureDisplay.x = newPosition.x;
        this._armatureDisplay.y = newPosition.y + this._armatureDisplay.height * 0.5;
    }

    private onDragEnd()
    {
        this._data.alpha = 1;
        this._dragging = false;
        // set the interaction data to null
        this._data = null;

        this._armatureDisplay.x = this._renderer.width * .5;
        this._armatureDisplay.y = this._renderer.height * .5;
    }

    private onDragMove()
    {
        if(this._dragging)
        {
            var newPosition = this._data.getLocalPosition(this._stage);
            this._armatureDisplay.x = newPosition.x;
            this._armatureDisplay.y = newPosition.y + this._armatureDisplay.height * 0.5;
        }
    }

    private _animationEventHandler(event:EventType):void
    {
        console.log(event.type, event.name, event.animationState.name);
    }

    private _renderHandler(deltaTime:number):void
    {
        dragonBones.WorldClock.clock.advanceTime(-1);
        this._renderer.render(this._stage);
    }
}
;
var main = new Main();
main.init();
