import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '@/config/gameConfig';

export class BootScene extends Phaser.Scene {
    constructor() {
        super(SCENES.BOOT);
    }

    preload(): void {
        this.createLoadingBar();
        this.generatePlaceholderAssets();
    }

    private createLoadingBar(): void {
        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;
        const barWidth = 300;
        const barHeight = 20;
        const x = (width - barWidth) / 2;
        const y = height / 2;

        this.add.rectangle(width / 2, height / 2, width, height, COLORS.black);

        const title = this.add.text(width / 2, y - 60, 'IL TEATRO DELLE OMBRE', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#e0d5c0',
        });
        title.setOrigin(0.5);

        const barBg = this.add.rectangle(x, y, barWidth, barHeight, 0x333333);
        barBg.setOrigin(0, 0.5);

        const bar = this.add.rectangle(x, y, 0, barHeight, COLORS.purple);
        bar.setOrigin(0, 0.5);

        this.load.on('progress', (value: number) => {
            bar.width = barWidth * value;
        });
    }

    private generatePlaceholderAssets(): void {
        // Genera personaggi con diverse caratteristiche
        this.generateCharacterSprite('player', { 
            body: 0xe0d5c0, 
            hair: 0x4a3728, 
            hairStyle: 'short' 
        });
        
        this.generateCharacterSprite('dario', { 
            body: 0xffdbac, 
            hair: 0x2a1a0f,
            hairStyle: 'messy',
            shirt: 0xcc3333
        });
        
        this.generateCharacterSprite('elisa', { 
            body: 0xffd5c0, 
            hair: 0x8b4513,
            hairStyle: 'long',
            lips: 0xff6b9d
        });
        
        this.generateCharacterSprite('shadow', { 
            body: 0x3a3a3a, 
            hair: 0x1a1a1a,
            hairStyle: 'hood',
            shirt: 0x1a1a1a
        });
        
        this.generateCharacterSprite('bully', { 
            body: 0xf0c0a0, 
            hair: 0x6b4423,
            hairStyle: 'bald',
            beard: 0x6b4423,
            shirt: 0x444444
        });
        
        this.generateSprite('mask', 16, 16, 0xf5f5dc);
        this.generateTileset();
    }

    private generateCharacterSprite(
        key: string, 
        features: {
            body: number;
            hair: number;
            hairStyle: 'short' | 'long' | 'messy' | 'bald' | 'hood';
            beard?: number;
            lips?: number;
            shirt?: number;
        }
    ): void {
        const width = 16;
        const height = 24;
        const totalWidth = width * 4; // 4 frame per direzione
        const totalHeight = height * 4; // 4 direzioni
        
        // Crea un canvas temporaneo
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = totalWidth;
        tempCanvas.height = totalHeight;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return;
        
        // Per ogni direzione e frame
        for (let dir = 0; dir < 4; dir++) {
            for (let frame = 0; frame < 4; frame++) {
                const x = frame * width;
                const y = dir * height;
                
                // Piedi/gambe
                this.drawLegs(ctx, x, y, frame, features.body, features.shirt);
                
                // Corpo
                this.drawBody(ctx, x, y, features.body, features.shirt);
                
                // Testa
                this.drawHead(ctx, x, y, features.body);
                
                // Occhi (direzione dipendente)
                this.drawEyes(ctx, x, y, dir);
                
                // Capelli
                this.drawHair(ctx, x, y, features.hair, features.hairStyle);
                
                // Barba opzionale
                if (features.beard) {
                    this.drawBeard(ctx, x, y, features.beard);
                }
                
                // Rossetto opzionale
                if (features.lips) {
                    this.drawLips(ctx, x, y, features.lips);
                }
            }
        }
        
        // Crea la texture dal canvas usando Base64
        const dataUrl = tempCanvas.toDataURL();
        const img = new Image();
        img.src = dataUrl;
        
        img.onload = () => {
            this.textures.addSpriteSheet(key, img, {
                frameWidth: width,
                frameHeight: height
            });
            
            // Crea animazioni dopo che la texture è caricata
            this.createCharacterAnims(key);
        };
    }

    private drawLegs(ctx: CanvasRenderingContext2D, baseX: number, baseY: number, frame: number, color: number, shirtColor?: number): void {
        const pantsColor = shirtColor ? this.darkenColor(shirtColor, 0.6) : this.darkenColor(color, 0.7);
        ctx.fillStyle = this.colorToHex(pantsColor);
        
        // Animazione gambe camminata
        const legOffset = frame === 1 ? 1 : frame === 3 ? -1 : 0;
        
        // Gamba sinistra
        ctx.fillRect(baseX + 5, baseY + 16 + legOffset, 2, 5);
        ctx.fillRect(baseX + 5, baseY + 21, 2, 3); // piede
        
        // Gamba destra
        ctx.fillRect(baseX + 9, baseY + 16 - legOffset, 2, 5);
        ctx.fillRect(baseX + 9, baseY + 21, 2, 3); // piede
    }

    private drawBody(ctx: CanvasRenderingContext2D, baseX: number, baseY: number, bodyColor: number, shirtColor?: number): void {
        // Torso
        const color = shirtColor || this.darkenColor(bodyColor, 0.8);
        ctx.fillStyle = this.colorToHex(color);
        ctx.fillRect(baseX + 4, baseY + 10, 8, 7);
        
        // Braccia
        ctx.fillStyle = this.colorToHex(bodyColor);
        ctx.fillRect(baseX + 3, baseY + 11, 2, 5); // braccio sinistro
        ctx.fillRect(baseX + 11, baseY + 11, 2, 5); // braccio destro
    }

    private drawHead(ctx: CanvasRenderingContext2D, baseX: number, baseY: number, color: number): void {
        ctx.fillStyle = this.colorToHex(color);
        // Testa ovale
        ctx.fillRect(baseX + 5, baseY + 3, 6, 8);
        ctx.fillRect(baseX + 4, baseY + 5, 8, 4);
    }

    private drawEyes(ctx: CanvasRenderingContext2D, baseX: number, baseY: number, direction: number): void {
        ctx.fillStyle = '#000000';
        
        // Occhi cambiano in base alla direzione
        // 0=down, 1=right, 2=up, 3=left
        switch(direction) {
            case 0: // down
                ctx.fillRect(baseX + 6, baseY + 7, 1, 2);
                ctx.fillRect(baseX + 9, baseY + 7, 1, 2);
                break;
            case 1: // right
                ctx.fillRect(baseX + 8, baseY + 7, 1, 1);
                ctx.fillRect(baseX + 10, baseY + 7, 1, 1);
                break;
            case 2: // up
                ctx.fillRect(baseX + 6, baseY + 6, 1, 1);
                ctx.fillRect(baseX + 9, baseY + 6, 1, 1);
                break;
            case 3: // left
                ctx.fillRect(baseX + 5, baseY + 7, 1, 1);
                ctx.fillRect(baseX + 7, baseY + 7, 1, 1);
                break;
        }
    }

    private drawHair(ctx: CanvasRenderingContext2D, baseX: number, baseY: number, color: number, style: string): void {
        ctx.fillStyle = this.colorToHex(color);
        
        switch(style) {
            case 'short':
                ctx.fillRect(baseX + 4, baseY + 3, 8, 3);
                ctx.fillRect(baseX + 3, baseY + 4, 2, 2);
                ctx.fillRect(baseX + 11, baseY + 4, 2, 2);
                break;
                
            case 'long':
                ctx.fillRect(baseX + 4, baseY + 2, 8, 4);
                ctx.fillRect(baseX + 3, baseY + 4, 2, 6);
                ctx.fillRect(baseX + 11, baseY + 4, 2, 6);
                break;
                
            case 'messy':
                ctx.fillRect(baseX + 4, baseY + 2, 8, 3);
                ctx.fillRect(baseX + 3, baseY + 3, 1, 3);
                ctx.fillRect(baseX + 12, baseY + 3, 1, 3);
                ctx.fillRect(baseX + 5, baseY + 1, 2, 1);
                ctx.fillRect(baseX + 9, baseY + 1, 2, 1);
                break;
                
            case 'hood':
                ctx.fillRect(baseX + 3, baseY + 2, 10, 8);
                ctx.fillRect(baseX + 2, baseY + 5, 12, 3);
                break;
                
            case 'bald':
                // Solo un po' di capelli ai lati
                ctx.fillRect(baseX + 3, baseY + 5, 2, 2);
                ctx.fillRect(baseX + 11, baseY + 5, 2, 2);
                break;
        }
    }

    private drawBeard(ctx: CanvasRenderingContext2D, baseX: number, baseY: number, color: number): void {
        ctx.fillStyle = this.colorToHex(color);
        ctx.fillRect(baseX + 5, baseY + 9, 6, 2);
        ctx.fillRect(baseX + 4, baseY + 9, 1, 1);
        ctx.fillRect(baseX + 11, baseY + 9, 1, 1);
    }

    private drawLips(ctx: CanvasRenderingContext2D, baseX: number, baseY: number, color: number): void {
        ctx.fillStyle = this.colorToHex(color);
        ctx.fillRect(baseX + 6, baseY + 9, 4, 1);
    }

    private createCharacterAnims(key: string): void {
        const directions = ['down', 'right', 'up', 'left'];
        
        directions.forEach((dir, dirIndex) => {
            // Animazione idle
            this.anims.create({
                key: `${key}_idle_${dir}`,
                frames: [{ key: key, frame: dirIndex * 4 }],
                frameRate: 1,
            });
            
            // Animazione walk
            this.anims.create({
                key: `${key}_walk_${dir}`,
                frames: this.anims.generateFrameNumbers(key, { 
                    start: dirIndex * 4, 
                    end: dirIndex * 4 + 3 
                }),
                frameRate: 8,
                repeat: -1,
            });
        });
    }

    private colorToHex(color: number): string {
        return '#' + color.toString(16).padStart(6, '0');
    }

    private darkenColor(color: number, factor: number): number {
        const r = Math.floor(((color >> 16) & 0xff) * factor);
        const g = Math.floor(((color >> 8) & 0xff) * factor);
        const b = Math.floor((color & 0xff) * factor);
        return (r << 16) | (g << 8) | b;
    }

    private generateSprite(key: string, width: number, height: number, color: number): void {
        const graphics = this.make.graphics({});
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(4, 6, 3, 3);
        graphics.fillRect(width - 7, 6, 3, 3);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    private generateTileset(): void {
        const tileSize = 16;
        const graphics = this.make.graphics({});

        graphics.fillStyle(0x4a3728, 1);
        graphics.fillRect(0, 0, tileSize, tileSize);
        graphics.generateTexture('tile_floor', tileSize, tileSize);

        graphics.clear();
        graphics.fillStyle(0x2a2a2a, 1);
        graphics.fillRect(0, 0, tileSize, tileSize);
        graphics.generateTexture('tile_wall', tileSize, tileSize);

        graphics.clear();
        graphics.fillStyle(0x6a0d0d, 1);
        graphics.fillRect(0, 0, tileSize, tileSize);
        graphics.generateTexture('tile_curtain', tileSize, tileSize);

        graphics.destroy();
    }

    create(): void {
        const loadingText = this.add.text(
            GAME_WIDTH / 2, 
            GAME_HEIGHT / 2 + 50, 
            'Caricamento completato...', 
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
            }
        );
        loadingText.setOrigin(0.5);
        
        this.time.delayedCall(1000, () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(SCENES.MENU);
            });
        });
    }
}
