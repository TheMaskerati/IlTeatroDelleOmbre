import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/gameConfig';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface TimeConfig {
    tint: number;
    ambientAlpha: number;
    lightColor: number;
}

const TIME_CONFIGS: Record<TimeOfDay, TimeConfig> = {
    morning: {
        tint: 0xfff5e6,
        ambientAlpha: 0.1,
        lightColor: 0xffdd99
    },
    afternoon: {
        tint: 0xffffff,
        ambientAlpha: 0,
        lightColor: 0xffffff
    },
    evening: {
        tint: 0xffaa66,
        ambientAlpha: 0.2,
        lightColor: 0xff8844
    },
    night: {
        tint: 0x3355aa,
        ambientAlpha: 0.5,
        lightColor: 0x4466cc
    }
};

class TimeManagerClass {
    private currentTime: TimeOfDay = 'afternoon';
    private progressionIndex: number = 0;
    private overlay: Phaser.GameObjects.Rectangle | null = null;
    private scene: Phaser.Scene | null = null;
    private listeners: ((time: TimeOfDay) => void)[] = [];

    private readonly PROGRESSION: TimeOfDay[] = [
        'morning', 'afternoon', 'evening', 'night'
    ];

    initialize(scene: Phaser.Scene): void {
        this.scene = scene;

        /* Create ambient overlay */
        this.overlay = scene.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            0x000000,
            0
        );
        this.overlay.setDepth(900);
        this.overlay.setScrollFactor(0);
        this.overlay.setBlendMode(Phaser.BlendModes.MULTIPLY);

        this.applyTimeEffects();
    }

    getCurrentTime(): TimeOfDay {
        return this.currentTime;
    }

    setTime(time: TimeOfDay): void {
        if (this.currentTime === time) return;
        this.currentTime = time;
        this.applyTimeEffects();
        this.notifyListeners();
    }

    advanceTime(): void {
        this.progressionIndex = (this.progressionIndex + 1) % this.PROGRESSION.length;
        this.setTime(this.PROGRESSION[this.progressionIndex]);
    }

    onTimeChange(listener: (time: TimeOfDay) => void): void {
        this.listeners.push(listener);
    }

    private notifyListeners(): void {
        for (const listener of this.listeners) {
            listener(this.currentTime);
        }
    }

    private applyTimeEffects(): void {
        if (!this.scene || !this.overlay) return;

        const config = TIME_CONFIGS[this.currentTime];

        /* Tween the overlay */
        this.scene.tweens.add({
            targets: this.overlay,
            fillAlpha: config.ambientAlpha,
            duration: 1000,
            ease: 'Sine.easeInOut'
        });

        /* Update overlay color */
        this.overlay.setFillStyle(this.invertTint(config.tint), config.ambientAlpha);
    }

    private invertTint(color: number): number {
        /* For multiply blend, we want darker colors for night */
        const r = 255 - ((color >> 16) & 0xff);
        const g = 255 - ((color >> 8) & 0xff);
        const b = 255 - (color & 0xff);
        return (r << 16) | (g << 8) | b;
    }

    getTint(): number {
        return TIME_CONFIGS[this.currentTime].tint;
    }

    isNight(): boolean {
        return this.currentTime === 'night';
    }

    getAmbientAlpha(): number {
        return TIME_CONFIGS[this.currentTime].ambientAlpha;
    }

    destroy(): void {
        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }
        this.scene = null;
        this.listeners = [];
    }
}

export const TimeManager = new TimeManagerClass();
