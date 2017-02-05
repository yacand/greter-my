module Game
{
    "use strict"
    import Main = Game.Main;

    class AppStart
    {
        constructor()
        {
        }

        public init():void
        {
            const main:Main = new Main();
            main.init();
        }
    }

    const appStart:AppStart = new AppStart();
    appStart.init();
}
