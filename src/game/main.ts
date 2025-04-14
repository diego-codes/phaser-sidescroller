import { AUTO, Game } from "phaser";
import { Game as MainGame } from "./scenes/Game";
import { UI } from "./scenes/UI";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 600,
    height: 600,
    parent: "game-container",
    physics: {
        default: "matter",
        matter: {
            // debug: true,
        },
    },
    scene: [MainGame, UI],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;

