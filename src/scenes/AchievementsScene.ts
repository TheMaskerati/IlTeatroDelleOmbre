import { BaseScene } from './BaseScene';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '@/config/gameConfig';
import { AchievementManager, Achievement } from '@/systems/AchievementManager';

export class AchievementsScene extends BaseScene {
    constructor() {
        super(SCENES.ACHIEVEMENTS);
    }

    create(): void {
        super.create();
        this.createBackground();
        this.createHeader();
        this.createAchievementGrid();
        this.createBackButton();
    }

    private createBackground(): void {
        const bg = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e);
        bg.setOrigin(0, 0);

        /* Decorative elements */
        for (let i = 0; i < 20; i++) {
            const star = this.add.star(
                Phaser.Math.Between(50, GAME_WIDTH - 50),
                Phaser.Math.Between(50, GAME_HEIGHT - 50),
                5, 3, 6, 0xd4af37, 0.2
            );
            this.tweens.add({
                targets: star,
                alpha: { from: 0.1, to: 0.4 },
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            });
        }
    }

    private createHeader(): void {
        const title = this.add.text(GAME_WIDTH / 2, 50, 'TROFEI', {
            fontFamily: 'Georgia, serif',
            fontSize: '36px',
            color: '#d4af37'
        });
        title.setOrigin(0.5);

        const progress = AchievementManager.getProgress();
        const subtitle = this.add.text(GAME_WIDTH / 2, 90, `${progress.unlocked} / ${progress.total} sbloccati`, {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#888888'
        });
        subtitle.setOrigin(0.5);
    }

    private createAchievementGrid(): void {
        const achievements = AchievementManager.getVisible();
        const cols = 3;
        const cardW = 200;
        const cardH = 100;
        const startX = (GAME_WIDTH - cols * cardW) / 2 + cardW / 2;
        const startY = 150;

        achievements.forEach((ach, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * cardW;
            const y = startY + row * (cardH + 20);

            this.createAchievementCard(x, y, ach);
        });
    }

    private createAchievementCard(x: number, y: number, ach: Achievement): void {
        const isUnlocked = ach.unlocked;

        const card = this.add.rectangle(x, y, 180, 90, isUnlocked ? 0x2a2a4e : 0x1a1a2e);
        card.setStrokeStyle(2, isUnlocked ? 0xd4af37 : 0x333344);

        const iconBg = this.add.circle(x - 50, y, 25, isUnlocked ? 0xd4af37 : 0x333344);

        const iconText = this.add.text(x - 50, y, this.getIconEmoji(ach.icon), {
            fontSize: '24px'
        });
        iconText.setOrigin(0.5);

        const name = this.add.text(x + 10, y - 20, ach.name, {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: isUnlocked ? '#ffffff' : '#666666'
        });
        name.setOrigin(0, 0.5);

        const desc = this.add.text(x + 10, y + 10, ach.description, {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: isUnlocked ? '#aaaaaa' : '#444444',
            wordWrap: { width: 100 }
        });
        desc.setOrigin(0, 0.5);

        if (!isUnlocked && ach.hidden) {
            name.setText('???');
            desc.setText('Segreto');
        }
    }

    private getIconEmoji(icon: string): string {
        const icons: Record<string, string> = {
            shield: 'S',
            star: '*',
            mask: 'M',
            dove: 'D',
            crown: 'C',
            clock: 'T',
            book: 'B',
            trophy: 'W',
            compass: 'X',
            heart: 'H'
        };
        return icons[icon] || '?';
    }

    private createBackButton(): void {
        const btn = this.add.text(50, GAME_HEIGHT - 40, '< INDIETRO', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#888888'
        });
        btn.setInteractive({ useHandCursor: true })
            .on('pointerover', () => btn.setColor('#ffffff'))
            .on('pointerout', () => btn.setColor('#888888'))
            .on('pointerdown', () => this.scene.start(SCENES.MENU));
    }
}
