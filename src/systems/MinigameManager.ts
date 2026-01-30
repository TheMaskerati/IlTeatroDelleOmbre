import Phaser from 'phaser';
import { MaskSystem } from './MaskSystem';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '@/config/gameConfig';

type MinigameType = 'qte' | 'balance';

export interface MinigameConfig {
    type?: MinigameType;
    difficultyMultiplier: number;
}

export class MinigameManager {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private isActive: boolean = false;
    private currentType: MinigameType | null = null;
    private onComplete: ((success: boolean) => void) | null = null;

    // QTE Props
    private qteCount: number = 0;
    private qteTarget: number = 5;
    private qteTimer: Phaser.Time.TimerEvent | null = null;
    private qteText: Phaser.GameObjects.Text;
    private qteInstructionText: Phaser.GameObjects.Text;

    // Balance Props
    private balanceCursor: Phaser.GameObjects.Rectangle;
    private balanceZone: Phaser.GameObjects.Rectangle;
    private balanceValue: number = 0; // -100 to 100
    private balanceVelocity: number = 0;
    private balanceTimer: Phaser.Time.TimerEvent | null = null;
    private balanceInstructionText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createUI();
    }

    private createUI(): void {
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(2000);
        this.container.setScrollFactor(0);
        this.container.setVisible(false);

        // Background Oscuro
        const bg = this.scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8);
        this.container.add(bg);

        // QTE UI
        this.qteText = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
            fontFamily: 'monospace', fontSize: '64px', color: '#ff0000', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.qteInstructionText = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'PREMI SPAZIO RAPIDAMENTE!', {
            fontFamily: 'monospace', fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5);

        this.container.add([this.qteText, this.qteInstructionText]);

        // Balance UI
        this.balanceZone = this.scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 400, 30, 0x555555);
        this.balanceCursor = this.scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 20, 40, 0x00ff00);

        this.balanceInstructionText = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'TIENI LA BARRA AL CENTRO CON A/D', {
            fontFamily: 'monospace', fontSize: '20px', color: '#00ff00'
        }).setOrigin(0.5);

        this.container.add([this.balanceZone, this.balanceCursor, this.balanceInstructionText]);
    }

    startRandom(difficulty: number, onComplete: (success: boolean) => void): void {
        const type = Math.random() > 0.5 ? 'qte' : 'balance';
        if (type === 'qte') {
            this.startQTE(difficulty, onComplete);
        } else {
            this.startBalance(difficulty, onComplete);
        }
    }

    startQTE(difficulty: number, onComplete: (success: boolean) => void): void {
        this.isActive = true;
        this.currentType = 'qte';
        this.onComplete = onComplete;
        this.qteCount = 0;

        // Difficulty Scaling
        this.qteTarget = Math.floor(5 + (difficulty * 2)); // 5, 7, 9...
        const timeLimit = Math.max(2000, 4000 - (difficulty * 300)); // 3s gets shorter

        this.container.setVisible(true);
        this.hideBalanceUI();
        this.qteText.setVisible(true);
        this.qteInstructionText.setVisible(true);
        this.qteText.setText(`0/${this.qteTarget}`);

        this.qteTimer = this.scene.time.delayedCall(timeLimit, () => {
            this.endMinigame(false);
        });

        this.scene.cameras.main.shake(200, 0.01);
    }

    startBalance(difficulty: number, onComplete: (success: boolean) => void): void {
        this.isActive = true;
        this.currentType = 'balance';
        this.onComplete = onComplete;

        this.container.setVisible(true);
        this.qteText.setVisible(false);
        this.qteInstructionText.setVisible(false);
        this.showBalanceUI();

        this.balanceValue = 0;
        this.balanceVelocity = (Math.random() > 0.5 ? 1 : -1) * 0.5;

        // Difficulty Scaling
        const duration = Math.min(8000, 4000 + (difficulty * 500)); // Longer survival needed

        this.balanceTimer = this.scene.time.delayedCall(duration, () => {
            this.endMinigame(true);
        });
    }

    update(time: number, delta: number): void {
        if (!this.isActive) return;

        if (this.currentType === 'qte') {
            if (Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE))) {
                this.qteCount++;
                this.qteText.setText(`${this.qteCount}/${this.qteTarget}`);
                this.scene.cameras.main.shake(50, 0.01);

                if (this.qteCount >= this.qteTarget) {
                    if (this.qteTimer) this.qteTimer.remove();
                    this.endMinigame(true);
                }
            }
        } else if (this.currentType === 'balance') {
            const keys = this.scene.input.keyboard!.createCursorKeys();

            if (keys.left.isDown || this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) {
                this.balanceVelocity -= 0.05;
            }
            if (keys.right.isDown || this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) {
                this.balanceVelocity += 0.05;
            }

            this.balanceVelocity += (Math.random() - 0.5) * 0.2;
            this.balanceValue += this.balanceVelocity;

            const maxOffset = 200;
            const xPos = (GAME_WIDTH / 2) + Math.max(-maxOffset, Math.min(maxOffset, this.balanceValue * 2));
            this.balanceCursor.x = xPos;

            if (Math.abs(this.balanceValue) > 100) {
                if (this.balanceTimer) this.balanceTimer.remove();
                this.endMinigame(false);
            }
        }
    }

    private hideBalanceUI(): void {
        this.balanceZone.setVisible(false);
        this.balanceCursor.setVisible(false);
        this.balanceInstructionText.setVisible(false);
    }

    private showBalanceUI(): void {
        this.balanceZone.setVisible(true);
        this.balanceCursor.setVisible(true);
        this.balanceInstructionText.setVisible(true);
    }

    private endMinigame(success: boolean): void {
        this.isActive = false;
        this.container.setVisible(false);

        if (success) {
            if (this.currentType === 'qte') MaskSystem.getInstance().modifyScore(1);
            if (this.currentType === 'balance') MaskSystem.getInstance().modifyScore(-1);
        }

        if (this.onComplete) this.onComplete(success);
    }

    public isMinigameActive(): boolean {
        return this.isActive;
    }
}
