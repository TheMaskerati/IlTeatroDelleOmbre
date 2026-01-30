import Phaser from 'phaser';
import { AudioManager } from './AudioManager';

export class MaskSystem {
    private static _instance: MaskSystem;
    private scene: Phaser.Scene;
    private score: number = 0;
    private glitchTimer: Phaser.Time.TimerEvent | null = null;
    private currentObjective: string = 'SOPRAVVIVI';

    private constructor() { }

    static getInstance(): MaskSystem {
        if (!MaskSystem._instance) {
            MaskSystem._instance = new MaskSystem();
        }
        return MaskSystem._instance;
    }

    init(scene: Phaser.Scene): void {
        this.scene = scene;
        this.score = 0;
        AudioManager.getInstance().init(scene);
        this.startGlitchEffect();
    }

    updateTask(task: string): void {
        this.currentObjective = task;
    }

    getObjective(): string {
        return this.currentObjective;
    }

    modifyScore(amount: number): void {
        this.score += amount;
        this.score = Phaser.Math.Clamp(this.score, -5, 5);
        AudioManager.getInstance().updateDynamicAudio(this.score);
    }

    getScore(): number {
        return this.score;
    }

    private startGlitchEffect(): void {
        /* Dynamic glitch based on High Score absolute value */
        if (this.glitchTimer) this.glitchTimer.remove();

        this.glitchTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                const intensity = Math.abs(this.score);
                if (intensity >= 4) {
                    /* Severe Glitch */
                    this.scene.cameras.main.shake(100, 0.005);
                    if (Math.random() > 0.7) {
                        this.scene.cameras.main.setZoom(0.99 + Math.random() * 0.02);
                        this.scene.time.delayedCall(50, () => this.scene.cameras.main.setZoom(1));
                    }
                } else if (intensity >= 2) {
                    /* Mild Glitch */
                    if (Math.random() > 0.8) {
                        this.scene.cameras.main.shake(50, 0.001);
                    }
                }
            },
            loop: true
        });
    }
}
