///<reference path="../../libs/Pixi/pixi.js.d.ts"/>
///<reference path="Preloader.ts"/>
var Game;
(function (Game) {
    "use strict";
    var Main = (function () {
        function Main() {
            this._game = new PIXI.WebGLRenderer(250, 250, { backgroundColor: 0xffffff });
            this._stage = new PIXI.Container();
            this._backgroud = new PIXI.Sprite(PIXI.Texture.EMPTY);
        }
        Main.prototype.init = function () {
            document.body.appendChild(this._game.view);
            this._stage.addChild(this._backgroud);
            this._backgroud.width = this._game.width;
            this._backgroud.height = this._game.height;
            this.startPreloader();
        };
        Main.prototype.startPreloader = function () {
            this._preloader = new Game.Preloader();
            this._preloader.init(this._game, this._stage);
        };
        return Main;
    }());
    Game.Main = Main;
})(Game || (Game = {}));
//# sourceMappingURL=Main.js.map