import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/gameConfig';

/**
 * Handles theatrical transitions like curtains.
 */
export class TransitionManager {
    private scene: Phaser.Scene;
    private leftCurtain!: Phaser.GameObjects.Rectangle;
    private rightCurtain!: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createCurtains();
    }

    private createCurtains(): void {
        this.leftCurtain = this.scene.add.rectangle(-GAME_WIDTH / 2, 0, GAME_WIDTH / 2, GAME_HEIGHT, 0x800000);
        this.leftCurtain.setOrigin(0);
        this.leftCurtain.setDepth(2000);
        this.leftCurtain.setScrollFactor(0);

        this.rightCurtain = this.scene.add.rectangle(GAME_WIDTH, 0, GAME_WIDTH / 2, GAME_HEIGHT, 0x800000);
        this.rightCurtain.setOrigin(0);
        this.rightCurtain.setDepth(2000);
        this.rightCurtain.setScrollFactor(0);
    }

    /**
     * Closes the curtains.
     */
    public close(duration: number = 800): Promise<void> {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this.leftCurtain,
                x: 0,
                duration,
                ease: 'Cubic.easeOut'
            });

            this.scene.tweens.add({
                targets: this.rightCurtain,
                x: GAME_WIDTH / 2,
                duration,
                ease: 'Cubic.easeOut',
                onComplete: () => resolve()
            });
        });
    }

    /**
     * Opens the curtains.
     */
    public open(duration: number = 800): Promise<void> {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this.leftCurtain,
                x: -GAME_WIDTH / 2,
                duration,
                ease: 'Cubic.easeIn'
            });

            this.scene.tweens.add({
                targets: this.rightCurtain,
                x: GAME_WIDTH,
                duration,
                ease: 'Cubic.easeIn',
                onComplete: () => resolve()
            });
        });
    }
}
