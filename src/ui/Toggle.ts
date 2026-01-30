import Phaser from 'phaser';

/**
 * Reusable Toggle switch component.
 */
export class Toggle extends Phaser.GameObjects.Container {
    private label: Phaser.GameObjects.Text;
    private background: Phaser.GameObjects.Rectangle;
    private knob: Phaser.GameObjects.Arc;
    private value: boolean;
    private onChange: (value: boolean) => void;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, initialValue: boolean, onChange: (val: boolean) => void) {
        super(scene, x, y);
        this.value = initialValue;
        this.onChange = onChange;

        /* Label */
        this.label = scene.add.text(0, -30, text, {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        /* Background (Track) */
        this.background = scene.add.rectangle(0, 0, 60, 30, this.value ? 0xd4af37 : 0x333333, 1).setOrigin(0.5);
        this.background.setStrokeStyle(2, 0xffffff);
        this.background.setInteractive({ useHandCursor: true });

        /* Knob */
        this.knob = scene.add.circle(this.value ? 15 : -15, 0, 12, 0xffffff);

        this.add([this.label, this.background, this.knob]);
        scene.add.existing(this);

        /* Input Interaction */
        this.background.on('pointerdown', () => this.toggle());
    }

    private toggle(): void {
        this.value = !this.value;
        this.updateVisuals();
        this.onChange(this.value);
    }

    private updateVisuals(): void {
        this.scene.tweens.add({
            targets: this.knob,
            x: this.value ? 15 : -15,
            duration: 200,
            ease: 'Back.out'
        });

        this.background.fillColor = this.value ? 0xd4af37 : 0x333333;
    }

    public getValue(): boolean {
        return this.value;
    }
}
