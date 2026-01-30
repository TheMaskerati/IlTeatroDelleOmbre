import Phaser from 'phaser';
import { PHASER_CONFIG } from '@/config/gameConfig';
import { BootScene } from '@/scenes/BootScene';
import { MenuScene } from '@/scenes/MenuScene';
import { GameScene } from '@/scenes/GameScene';
import { PauseScene } from '@/scenes/PauseScene';
import { SettingsScene } from '@/scenes/SettingsScene';
import { AchievementsScene } from '@/scenes/AchievementsScene';
import { CreditsScene } from '@/scenes/CreditsScene';

const config: Phaser.Types.Core.GameConfig = {
    ...PHASER_CONFIG,
    parent: 'game',
    scene: [BootScene, MenuScene, GameScene, PauseScene, SettingsScene, AchievementsScene, CreditsScene],
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    render: {
        batchSize: 2000,
        pixelArt: true,
        roundPixels: true
    }
};

document.addEventListener('DOMContentLoaded', () => {
    new Phaser.Game(config);
});
