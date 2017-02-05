///<reference path="Game/Main.ts"/>
module Game
{
    "use strict"

    class AppStart
    {
        constructor()
        {
        }

        public init():void
        {
            const main:Game.Main = new Game.Main();
            main.init();
        }
    }

    const appStart:AppStart = new AppStart();
    appStart.init();
}
