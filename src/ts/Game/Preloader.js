///<reference path="GameView.ts"/>
///<reference path="../../libs/DragonBonesJS/DragonBones/build/dragonBones.d.ts"/>
var Game;
(function (Game) {
    "use strict";
    var Preloader = (function () {
        function Preloader() {
            "use strict";
            this._game = null;
            this._stage = null;
            this._gameView = null;
        }
        Preloader.prototype.init = function (game, stage) {
            this._game = game;
            this._stage = stage;
            PIXI.ticker.shared.add(this._renderHandler, this);
            PIXI.loader.add("dragonBonesData", "./resources/art_ske.json");
            PIXI.loader.add("textureDataA", "./resources/art_tex.json");
            PIXI.loader.add("textureA", "./resources/art_tex.png");
            PIXI.loader.once("complete", this._loadCompleteHandler, this);
            PIXI.loader.load();
        };
        Preloader.prototype._renderHandler = function (deltaTime) {
            dragonBones.WorldClock.clock.advanceTime(-1);
            this._game.render(this._stage);
        };
        Preloader.prototype._loadCompleteHandler = function (loader, object) {
            dragonBones.PixiFactory.factory.parseDragonBonesData(object["dragonBonesData"].data);
            dragonBones.PixiFactory.factory.parseTextureAtlasData(object["textureDataA"].data, object["textureA"].texture);
            this._gameView = new Game.GameView();
            this._gameView.init(this._game, this._stage);
        };
        return Preloader;
    }());
    Game.Preloader = Preloader;
})(Game || (Game = {}));
//# sourceMappingURL=Preloader.js.map