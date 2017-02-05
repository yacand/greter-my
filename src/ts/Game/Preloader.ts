///<reference path="GameView.ts"/>
///<reference path="../../libs/DragonBonesJS/DragonBones/build/dragonBones.d.ts"/>
module Game
{
    "use strict"

    export class Preloader
    {
        private _game = null;
        private _stage = null;
        private _gameView:GameView = null;

        public constructor()
        {
            "use strict"
        }

        public init(game:PIXI.WebGLRenderer, stage:PIXI.Container):void
        {
            this._game = game;
            this._stage = stage;

            PIXI.ticker.shared.add(this._renderHandler, this);

            PIXI.loader.add("dragonBonesData", "./resources/art_ske.json");
            PIXI.loader.add("textureDataA", "./resources/art_tex.json");
            PIXI.loader.add("textureA", "./resources/art_tex.png");
            PIXI.loader.once("complete", this._loadCompleteHandler, this);
            PIXI.loader.load();
        }

        private _renderHandler(deltaTime:number):void
        {
            dragonBones.WorldClock.clock.advanceTime(-1);
            this._game.render(this._stage);
        }

        private _loadCompleteHandler(loader:PIXI.loaders.Loader, object:dragonBones.Map<PIXI.loaders.Resource>):void
        {
            dragonBones.PixiFactory.factory.parseDragonBonesData(object["dragonBonesData"].data);
            dragonBones.PixiFactory.factory.parseTextureAtlasData(object["textureDataA"].data, object["textureA"].texture);

            this._gameView = new GameView();
            this._gameView.init(this._game, this._stage);
        }
    }
}
