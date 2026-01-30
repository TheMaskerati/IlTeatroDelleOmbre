import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '@/config/gameConfig';
import { Slider } from '@/ui/Slider';
import { AudioManager } from '@/systems/AudioManager';
import { SaveSystem } from '@/systems/SaveSystem';

/**
 * Settings Scene
 * Allows the player to adjust volume and other game settings.
 */
export class SettingsScene extends Phaser.Scene {
    private audioManager!: AudioManager;

    constructor() {
        super(SCENES.SETTINGS);
    }

    create(): void {
        this.audioManager = AudioManager.getInstance(this);
        const settings = SaveSystem.getSettings();

        const centerX = GAME_WIDTH / 2;
        const centerY = GAME_HEIGHT / 2;

        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.black).setOrigin(0);

        this.add.text(centerX, 80, 'IMPOSTAZIONI', {
            fontFamily: 'serif',
            fontSize: '48px',
            color: '#e0d5c0',
        }).setOrigin(0.5);

        /* Volume Settings */
        new Slider(this, centerX, 200, 'VOLUME MUSICA', settings.musicVolume, 300, (val) => {
            this.audioManager.setMusicVolume(val);
            SaveSystem.setMusicVolume(val);
        });

        new Slider(this, centerX, 300, 'VOLUME EFFETTI', settings.sfxVolume, 300, (val) => {
            this.audioManager.setSFXVolume(val);
            SaveSystem.setSFXVolume(val);
        });

        const backBtn = this.add.text(centerX, 450, 'INDIETRO', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#ffffff',
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        backBtn.on('pointerover', () => backBtn.setColor('#d4af37'));
        backBtn.on('pointerout', () => backBtn.setColor('#ffffff'));
        backBtn.on('pointerdown', () => {
            this.scene.stop();
            /* If launched from Pause, it resumes automatically.
               If from Menu, we might need a specific transition or just stopping is enough. */
        });
    }
}
