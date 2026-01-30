import Phaser from 'phaser';

/**
 * Effects Manager
 * Handles screen-wide visual feedback like camera shake, flashes, and fades.
 */
export class EffectsManager {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * Shakes the main camera.
     */
    public shake(duration: number = 200, intensity: number = 0.01): void {
        this.scene.cameras.main.shake(duration, intensity);
    }

    /**
     * Flashes the screen with a specific color.
     */
    public flash(duration: number = 500, color: number = 0xffffff): void {
        this.scene.cameras.main.flash(duration, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
    }

    /**
     * Briefly tints the screen (good for damage or low health).
     */
    public tintScreen(color: number, duration: number = 500): void {
        const overlay = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, color, 0.3);
        overlay.setOrigin(0);
        overlay.setScrollFactor(0);
        overlay.setDepth(1000);

        this.scene.tweens.add({
            targets: overlay,
            alpha: 0,
            duration: duration,
            onComplete: () => overlay.destroy()
        });
    }

    /**
     * Zoom effect.
     */
    public zoom(level: number, duration: number = 1000): void {
        this.scene.cameras.main.zoomTo(level, duration, 'Power2');
    }

    /**
     * Creates a particle explosion with performance limits.
     */
    public createExplosion(x: number, y: number, color: number = 0xffffff): void {
        /* Simple limiter: check existing emitters */
        if (this.scene.children.list.filter(c => c.type === 'ParticleEmitterManager').length > 5) {
            return; /* Skip if too many particles */
        }

        const particles = this.scene.add.particles(x, y, 'star', {
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 800,
            quantity: 10,
            tint: color
        });

        this.scene.time.delayedCall(1000, () => particles.destroy());
    }
}
