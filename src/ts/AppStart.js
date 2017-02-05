///<reference path="Game/Main.ts"/>
var Game;
(function (Game) {
    "use strict";
    var AppStart = (function () {
        function AppStart() {
        }
        AppStart.prototype.init = function () {
            var main = new Game.Main();
            main.init();
        };
        return AppStart;
    }());
    var appStart = new AppStart();
    appStart.init();
})(Game || (Game = {}));
//# sourceMappingURL=AppStart.js.map