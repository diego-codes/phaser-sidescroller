import Phaser from "phaser";
import { events } from "./EventCenter";
export class UI extends Phaser.Scene {
    private starsLabel: Phaser.GameObjects.Text;
    private starsCollected = 0;
    private graphics: Phaser.GameObjects.Graphics;

    private lastHealth = 100;

    constructor() {
        super("ui");
    }

    init() {
        this.starsCollected = 0;
    }

    create() {
        this.graphics = this.add.graphics();
        this.setHealthBar(this.lastHealth);

        this.starsLabel = this.add.text(
            10,
            35,
            `Stars: ${this.starsCollected}`,
            {
                fontSize: "32px",
                color: "#fff",
            }
        );

        events.on("star-collected", this.handleStarCollected, this);
        events.on("health-changed", this.handleHealthChanged, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, () => {
            events.off("star-collected", this.handleStarCollected, this);
        });
    }

    private handleStarCollected() {
        ++this.starsCollected;
        this.starsLabel.text = `Stars: ${this.starsCollected}`;
    }

    private setHealthBar(health: number) {
        const width = 200;
        const percent = Phaser.Math.Clamp(health, 0, 100) / 100;

        this.graphics.clear();
        this.graphics.fillStyle(0x808080);
        this.graphics.fillRoundedRect(10, 10, width, 20, 5);
        if (health > 0) {
            this.graphics.fillStyle(0x00ff00);
            this.graphics.fillRoundedRect(10, 10, width * percent, 20, 5);
        }
    }

    handleHealthChanged(health: number) {
        this.tweens.addCounter({
            from: this.lastHealth,
            to: health,
            duration: 200,
            onUpdate: (tween) => {
                const value = tween.getValue();
                this.setHealthBar(value);
            },
        });
        this.lastHealth = health;
    }
}

