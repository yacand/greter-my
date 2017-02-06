module Game
{
    "use strict"
    import PointType = PIXI.Point;
    import InteractionEvent = PIXI.interaction.InteractionEvent;
    import ArmatureDisplayType = dragonBones.PixiArmatureDisplay;
    import EventType = dragonBones.EventObject;
    import Bone = dragonBones.Bone;


    export class GameView
    {
        private _game:PIXI.WebGLRenderer = null;
        private _stage:PIXI.Container = null;
        private _data:any = null;
        private _armatureDisplay:dragonBones.PixiArmatureDisplay = null;
        private _dragging:boolean = false;


        public constructor()
        {

        }

        public init(game:PIXI.WebGLRenderer, stage:PIXI.Container):void
        {
            this._game = game;
            this._stage = stage;

            this._stage.interactive = true;
            var armature = dragonBones.PixiFactory.factory.buildArmature("shipball");
            var armatureDisplay = <ArmatureDisplayType>armature.display;
            armatureDisplay.x = this._game.width * .5;
            armatureDisplay.y = this._game.height * .5;
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
            // armatureDisplay.x = this._game.width * .5;
            // armatureDisplay.y = this._game.height * .5;
            // armature.animation.play("newAnimation");
            armatureDisplay.interactive = true;
            armatureDisplay.buttonMode = true;

            armatureDisplay.on('pointerdown', this.onDragStart, this);
            armatureDisplay.on('pointerup', this.onDragEnd, this);
            armatureDisplay.on('pointerupoutside', this.onDragEnd, this);
            armatureDisplay.on('pointermove', this.onDragMove, this);
            //var interactionManager:PIXI.interaction.InteractionManager = new PIXI.interaction.InteractionManager(this._game);
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

            this._armatureDisplay.x = this._game.width * .5;
            this._armatureDisplay.y = this._game.height * .5;
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
            this._game.render(this._stage);
        }
    }
}
