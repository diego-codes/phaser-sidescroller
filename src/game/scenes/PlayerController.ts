import { StateMachine } from "../../StateMachine/StateMachine";

export class PlayerController {
    private walkingStateMachine: StateMachine<PlayerController>;
    private jumpingStateMachine: StateMachine<PlayerController>;

    constructor(
        private sprite: Phaser.Physics.Matter.Sprite,
        private cursors: Phaser.Types.Input.Keyboard.CursorKeys
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
            .setState("idle");

        this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
            const body = data.bodyB as MatterJS.BodyType;
            const gameObject = body.gameObject;

            if (!gameObject) {
                return;
            }

            if (gameObject instanceof Phaser.Physics.Matter.TileBody) {
                if (this.jumpingStateMachine.isCurrentState("jump")) {
                    this.jumpingStateMachine.setState("idle");
                }

                return;
            }

            const sprite = gameObject as Phaser.Physics.Matter.Sprite;
            const type = sprite.getData("type");
            if (type === "star") {
                sprite.destroy();
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

