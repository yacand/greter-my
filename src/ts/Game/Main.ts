///<reference path="../../libs/Pixi/pixi.js.d.ts"/>
///<reference path="Preloader.ts"/>
module Game
{
    "use strict"

    export class Main
    {
        private _game = new PIXI.WebGLRenderer(250, 250, {backgroundColor:0xffffff});
        private _stage = new PIXI.Container();
        private _backgroud:PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
        private _preloader:Preloader;

        constructor()
        {
        }

        public init():void
        {
            document.body.appendChild(this._game.view);
            this._stage.addChild(this._backgroud);
            this._backgroud.width = this._game.width;
            this._backgroud.height = this._game.height;

            this.startPreloader();
        }

        private startPreloader():void
        {
            this._preloader = new Preloader();
            this._preloader.init(this._game, this._stage);
        }
    }
}
