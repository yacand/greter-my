///<reference path="../../libs/DragonBonesJS/DragonBones/build/dragonBones.d.ts"/>
///<reference path="../../libs/DragonBonesJS/Pixi/build/dragonBonesPixi.d.ts"/>
var Game;
(function (Game) {
    "use strict";
    var GameView = (function () {
        function GameView() {
            this._game = null;
            this._stage = null;
            this._data = null;
            this._armatureDisplay = null;
            this._dragging = false;
        }
        GameView.prototype.init = function (game, stage) {
            this._game = game;
            this._stage = stage;
            this._stage.interactive = true;
            var armature = dragonBones.PixiFactory.factory.buildArmature("shipball");
            var armatureDisplay = armature.display;
            armatureDisplay.x = this._game.width * .5;
            armatureDisplay.y = this._game.height * .5;
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
        };
        GameView.prototype.onDragStart = function (event) {
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
        GameView.prototype.onDragEnd = function () {
            this._data.alpha = 1;
            this._dragging = false;
            // set the interaction data to null
            this._data = null;
            this._armatureDisplay.x = this._game.width * .5;
            this._armatureDisplay.y = this._game.height * .5;
        };
        GameView.prototype.onDragMove = function () {
            if (this._dragging) {
                var newPosition = this._data.getLocalPosition(this._stage);
                this._armatureDisplay.x = newPosition.x;
                this._armatureDisplay.y = newPosition.y + this._armatureDisplay.height * 0.5;
            }
        };
        GameView.prototype._animationEventHandler = function (event) {
            console.log(event.type, event.name, event.animationState.name);
        };
        GameView.prototype._renderHandler = function (deltaTime) {
            dragonBones.WorldClock.clock.advanceTime(-1);
            this._game.render(this._stage);
        };
        return GameView;
    }());
    Game.GameView = GameView;
})(Game || (Game = {}));
//# sourceMappingURL=GameView.js.map