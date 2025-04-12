import Phaser from "phaser";
import { PlayerController } from "./PlayerController";

export class Game extends Phaser.Scene {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private penguin?: Phaser.Physics.Matter.Sprite;
    private playerController?: PlayerController;
    constructor() {
        super("game");
    }

    init() {
        this.cursors = this.input.keyboard!.createCursorKeys();
    }

    preload() {
        this.load.atlas("penguin", "assets/penguin.png", "assets/penguin.json");
        this.load.image("tiles", "assets/sheet.png");
        this.load.tilemapTiledJSON("tilemap", "assets/game.json");
        this.load.image("star", "assets/star.png");
    }

    create() {
        const map = this.make.tilemap({ key: "tilemap" });
        const tileset = map.addTilesetImage("iceworld", "tiles");
        const ground = map.createLayer("ground", tileset!);
        ground?.setCollisionByProperty({ collides: true });

        const objectsLayer = map.getObjectLayer("objects");
        objectsLayer?.objects.forEach((objData) => {
            const { x = 0, y = 0, width = 0, name } = objData;
            switch (name) {
                case "penguin-spawn": {
                    this.penguin = this.matter.add
                        .sprite(x + width * 0.5, y, "penguin")
                        .setFixedRotation();
                    this.playerController = new PlayerController(
                        this.penguin,
                        this.cursors
                    );

                    this.cameras.main.startFollow(this.penguin);
                    break;
                }

                case "star": {
                    const star = this.matter.add.sprite(
                        x,
                        y,
                        "star",
                        undefined,
                        {
                            isStatic: true,
                            isSensor: true,
                        }
                    );
                    star.setData("type", "star");
                    break;
                }
            }
        });

        this.matter.world.convertTilemapLayer(ground!);
    }

    update(_: number, dt: number) {
        this.playerController?.update(dt);
    }
}

