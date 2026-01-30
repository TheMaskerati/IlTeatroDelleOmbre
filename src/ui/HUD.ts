import Phaser from 'phaser';

/**
 * HUD System
 * Displays Karma, Mask Tension, Objective, and Stage info.
 */
export class HUD {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;

    /* Karma Elements */
    private karmaText: Phaser.GameObjects.Text;
    private karmaIndicator: Phaser.GameObjects.Arc;

    /* Mask Elements */
    private maskBar: Phaser.GameObjects.Rectangle;
    private maskText: Phaser.GameObjects.Text;

    /* Narrative Elements */
    private objectiveText: Phaser.GameObjects.Text;
    private stageText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(1000);

        this.createHUD();
    }

    private createHUD(): void {
        const padding = 20;

        /* --- KARMA (Top Left) --- */
        const karmaBg = this.scene.add.rectangle(padding, padding, 180, 40, 0x000000, 0.6).setOrigin(0);
        this.karmaIndicator = this.scene.add.arc(padding + 20, padding + 20, 8, 0, 360, false, 0xffffff);
        this.karmaText = this.scene.add.text(padding + 40, padding + 10, 'KARMA: 0', {
            fontFamily: 'monospace', fontSize: '16px', color: '#ffffff'
        });

        /* --- MASK TENSION (Top Center) --- */
        const maskBg = this.scene.add.rectangle(Phaser.Math.Between(0, 0), padding, 220, 40, 0x000000, 0.6).setOrigin(0.5, 0);
        maskBg.x = this.scene.cameras.main.width / 2;

        const barWidth = 150;
        const barBg = this.scene.add.rectangle(maskBg.x - 30, padding + 20, barWidth, 12, 0x333333).setOrigin(0.5);
        this.maskBar = this.scene.add.rectangle(maskBg.x - 30, padding + 20, 0, 12, 0xffffff).setOrigin(0.5);
        this.maskText = this.scene.add.text(maskBg.x + 60, padding + 10, '0', {
            fontFamily: 'monospace', fontSize: '16px', color: '#ffffff'
        }).setOrigin(0.5, 0);

        /* --- OBJECTIVE (Bottom Center) --- */
        this.objectiveText = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height - 40, 'OBIETTIVO: ???', {
            fontFamily: 'monospace', fontSize: '18px', color: '#ffd700',
            backgroundColor: '#000000aa', padding: { x: 15, y: 8 }
        }).setOrigin(0.5);

        /* --- STAGE (Top Right) --- */
        this.stageText = this.scene.add.text(this.scene.cameras.main.width - padding, padding, 'STAGE 1', {
            fontFamily: 'monospace', fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(1, 0);

        this.container.add([
            karmaBg, this.karmaIndicator, this.karmaText,
            maskBg, barBg, this.maskBar, this.maskText,
            this.objectiveText, this.stageText
        ]);
    }

    /**
     * Updates the data displayed in the HUD.
     */
    public update(data: { karma: number, maskScore: number, stage: number, objective?: string }): void {
        /* Update Karma */
        this.karmaText.setText(`KARMA: ${data.karma}`);
        if (data.karma > 0) this.karmaIndicator.setFillStyle(0xd4af37);
        else if (data.karma < 0) this.karmaIndicator.setFillStyle(0xc41e3a);
        else this.karmaIndicator.setFillStyle(0xffffff);

        /* Update Mask */
        this.maskText.setText(`${data.maskScore}`);
        const absScore = Math.abs(data.maskScore);
        const mappedWidth = (absScore / 5) * 150;
        this.maskBar.width = Math.max(mappedWidth, 2);

        if (data.maskScore > 0) this.maskBar.setFillStyle(0xff0000); /* Tension */
        else if (data.maskScore < 0) this.maskBar.setFillStyle(0x00ff00); /* Control */
        else this.maskBar.setFillStyle(0xffffff);

        /* Update Stage */
        this.stageText.setText(`STAGE ${data.stage}`);

        /* Update Objective */
        if (data.objective) {
            this.objectiveText.setText(`OBIETTIVO: ${data.objective.toUpperCase()}`);
        }
    }

    public setVisible(visible: boolean): void {
        this.container.setVisible(visible);
    }
}
