import { StateMachine } from "../../StateMachine/StateMachine";
import { ObstaclesController } from "../ObstaclesController";
import { events as events } from "./EventCenter";

export class PlayerController {
    private walkingStateMachine: StateMachine<PlayerController>;
    private jumpingStateMachine: StateMachine<PlayerController>;

    private health = 100;

    constructor(
        private scene: Phaser.Scene,
        private sprite: Phaser.Physics.Matter.Sprite,
        private cursors: Phaser.Types.Input.Keyboard.CursorKeys,
        private obstacles: ObstaclesController
    ) {
        this.createAnimations();
        this.walkingStateMachine = new StateMachine(this, "player-walk");
        this.walkingStateMachine
            .addState("idle", {
                onEnter: this.idleOnEnter,
                onUpdate: this.idleOnUpdate,
            })
            .addState("walk", {
                onEnter: this.walkOnEnter,
                onUpdate: this.walkOnUpdate,
            })
            .setState("idle");

        this.jumpingStateMachine = new StateMachine(this, "player-jump")
            .addState("idle", {
                onUpdate: this.jumpIdleOnUpdate,
            })
            .addState("jump", {
                onEnter: this.jumpOnEnter,
            })
            .addState("spike-hit", {
                onEnter: this.spikeHitOnEnter,
            })
            .setState("idle");

        this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
            const body = data.bodyB as MatterJS.BodyType;
            const gameObject = body.gameObject;

            if (this.obstacles.is("spikes", body)) {
                this.jumpingStateMachine.setState("spike-hit");
                return;
            }

            if (!gameObject) {
                return;
            }

            if (gameObject instanceof Phaser.Physics.Matter.TileBody) {
                if (!this.jumpingStateMachine.isCurrentState("idle")) {
                    this.jumpingStateMachine.setState("idle");
                }

                return;
            }

            const sprite = gameObject as Phaser.Physics.Matter.Sprite;
            const type = sprite.getData("type");
            switch (type) {
                case "star": {
                    events.emit("star-collected");
                    sprite.destroy();
                    break;
                }

                case "health": {
                    const value = sprite.getData("healthPoints") ?? 10;
                    this.health = Phaser.Math.Clamp(
                        this.health + value,
                        0,
                        100
                    );
                    events.emit("health-changed", this.health);
                    sprite.destroy();
                    break;
                }
            }
        });
    }

    update(dt: number) {
        this.walkingStateMachine.update(dt);
        this.jumpingStateMachine.update(dt);
    }

    private idleOnEnter() {
        this.sprite.play("player-idle");
    }

    private idleOnUpdate() {
        if (this.cursors.left.isDown || this.cursors.right.isDown) {
            this.walkingStateMachine.setState("walk");
        }
    }

    private walkOnEnter() {
        this.sprite.play("player-walk", true);
    }

    private walkOnUpdate() {
        const speed =
            this.cursors.shift.isDown &&
            this.jumpingStateMachine.isCurrentState("idle")
                ? 10
                : 5;
        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-speed);
            this.sprite.flipX = true;
            return;
        }
        if (this.cursors.right.isDown) {
            this.sprite.setVelocityX(speed);
            this.sprite.flipX = false;
            return;
        }

        this.walkingStateMachine.setState("idle");
    }

    private jumpIdleOnUpdate() {
        if (this.spaceJustPressed) {
            this.jumpingStateMachine.setState("jump");
        }
    }

    get spaceJustPressed() {
        return Phaser.Input.Keyboard.JustDown(this.cursors.space);
    }

    private jumpOnEnter() {
        this.sprite.setVelocityY(-15);
    }

    private spikeHitOnEnter() {
        this.health = Phaser.Math.Clamp(this.health - 10, 0, 100);
        events.emit("health-changed", this.health);
        const negativeVelocity = this.sprite.getVelocity().x * -1;
        this.sprite.setVelocity(negativeVelocity, -12);
        const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
        const endColor = Phaser.Display.Color.ValueToColor(0xff0000);

        this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 100,
            repeat: 2,
            yoyo: true,
            ease: Phaser.Math.Easing.Sine.InOut,
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                const value = tween.getValue();
                const colorOjbect =
                    Phaser.Display.Color.Interpolate.ColorWithColor(
                        startColor,
                        endColor,
                        100,
                        value
                    );
                const color = Phaser.Display.Color.GetColor(
                    colorOjbect.r,
                    colorOjbect.g,
                    colorOjbect.b
                );
                this.sprite.setTint(color);
            },
        });

        this.jumpingStateMachine.setState("idle");
    }

    private createAnimations() {
        this.sprite.anims.create({
            key: "player-idle",
            frames: [{ key: "penguin", frame: "penguin_walk01.png" }],
        });

        this.sprite.anims.create({
            key: "player-walk",
            frameRate: 10,
            frames: this.sprite.anims.generateFrameNames("penguin", {
                start: 1,
                end: 4,
                prefix: "penguin_walk0",
                suffix: ".png",
            }),
            repeat: -1,
        });
    }
}

