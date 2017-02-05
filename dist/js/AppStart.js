var Game;
(function (Game) {
    "use strict";
    var Main = Game.Main;
    var AppStart = (function () {
        function AppStart() {
        }
        AppStart.prototype.init = function () {
            var main = new Main();
            main.init();
        };
        return AppStart;
    }());
    var appStart = new AppStart();
    appStart.init();
})(Game || (Game = {}));
//# sourceMappingURL=AppStart.js.map