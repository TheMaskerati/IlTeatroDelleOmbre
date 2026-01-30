import { BaseScene } from './BaseScene';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, SCALE } from '@/config/gameConfig';
import { ENEMIES } from '@/config/constants';
import { Player } from '@/entities/Player';
import { NPC } from '@/entities/NPC';
import { MapManager, DoorConfig } from '@/systems/MapManager';
import { DialogManager } from '@/systems/DialogManager';
import { MaskSystem } from '@/systems/MaskSystem';
import { MinigameManager } from '@/systems/MinigameManager';
import { MapKey } from '@/types/game';

interface GameSceneData {
    map?: MapKey;
    playerX?: number;
    playerY?: number;
    stage?: number; // Nuovo: Traccia il round corrente
}

export class GameScene extends BaseScene {
    private player!: Player;
    private npcs: NPC[] = [];
    private currentMap!: MapKey;
    private mapManager!: MapManager;
    private dialogManager!: DialogManager;
    private minigameManager!: MinigameManager;
    private interactionPrompt!: Phaser.GameObjects.Text;
    private mapNameText!: Phaser.GameObjects.Text;
    private stageText!: Phaser.GameObjects.Text;

    private stage: number = 1;
    private static tutorialDone = false;

    // Map Cycle per Endless Mode
    private readonly MAP_CYCLE: MapKey[] = ['theater', 'bar', 'fatherHouse'];

    constructor() {
        super(SCENES.GAME);
    }

    init(data?: GameSceneData): void {
        super.init();
        this.currentMap = data?.map || 'apartment';
        this.stage = data?.stage || 1;
        this.npcs = [];
    }

    create(data?: GameSceneData): void {
        super.create();

        // 1. Setup Map e Player
        this.mapManager = new MapManager(this, this.currentMap);
        const { walls, mapWidth, mapHeight } = this.mapManager.create();

        const startPos = this.getStartPosition(data);
        this.player = new Player(this, startPos.x, startPos.y);

        this.createNPCs();
        this.createUI();

        // 2. Init Nuovi Sistemi
        this.dialogManager = new DialogManager(this);
        this.minigameManager = new MinigameManager(this);
        MaskSystem.getInstance().init(this);

        this.physics.add.collider(this.player.getSprite(), walls);
        this.setupNPCCollisions();
        this.setupDoorTriggers();
        this.setupCamera(mapWidth, mapHeight);

        // 3. Game Flow Logic
        if (this.currentMap === 'apartment' && !GameScene.tutorialDone) {
            this.startTutorial();
        } else {
            this.showMapName();
            MaskSystem.getInstance().updateTask('TROVA L\'USCITA');
        }
    }

    private getStartPosition(data?: GameSceneData): { x: number; y: number } {
        if (data?.playerX !== undefined && data?.playerY !== undefined) {
            return { x: data.playerX, y: data.playerY };
        }
        const defaults: Record<string, { x: number; y: number }> = {
            apartment: { x: 10 * TILE_SIZE * SCALE, y: 10 * TILE_SIZE * SCALE },
            theater: { x: 5 * TILE_SIZE * SCALE, y: 20 * TILE_SIZE * SCALE },
            bar: { x: 8 * TILE_SIZE * SCALE, y: 15 * TILE_SIZE * SCALE },
            fatherHouse: { x: 12 * TILE_SIZE * SCALE, y: 15 * TILE_SIZE * SCALE },
        };
        return defaults[this.currentMap] || { x: 100, y: 100 };
    }

    private createNPCs(): void {
        // Spawn NPC random per encounter in base alla mappa
        // In Endless Mode, ogni mappa ha un "Guardian" o NPC casuale
        const npcIds = this.mapManager.getNPCIds();

        npcIds.forEach(id => {
            // Semplificazione: Spawniamo solo se defined in ENEMIES
            if (ENEMIES[id]) {
                const npc = new NPC(this, ENEMIES[id]);
                this.npcs.push(npc);
            }
        });
    }

    private createUI(): void {
        // Prompt
        this.interactionPrompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '[E] Interagisci', {
            fontFamily: 'monospace', fontSize: '14px',
            color: '#ffffff', backgroundColor: '#000000cc', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(500).setVisible(false);

        // Map Name
        this.mapNameText = this.add.text(GAME_WIDTH / 2, 30, '', {
            fontFamily: 'monospace', fontSize: '20px',
            color: '#ffd700', backgroundColor: '#000000aa', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(500).setAlpha(0);

        // Stage Display
        this.stageText = this.add.text(GAME_WIDTH - 20, 20, `STAGE ${this.stage}`, {
            fontFamily: 'monospace', fontSize: '24px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
    }

    private showMapName(): void {
        const names: Record<string, string> = {
            apartment: 'Il Risveglio',
            theater: 'Il Teatro',
            bar: 'Il Bar',
            fatherHouse: 'La Casa',
        };
        const name = names[this.currentMap] || this.currentMap;
        this.mapNameText.setText(`${name} - Round ${this.stage}`);
        this.tweens.add({ targets: this.mapNameText, alpha: 1, duration: 500, hold: 2000, yoyo: true });
    }

    private startTutorial(): void {
        this.time.delayedCall(1000, () => {
            this.dialogManager.show('intro_apartment', () => {
                GameScene.tutorialDone = true;
                MaskSystem.getInstance().updateTask('ESCI DALLO STUDIO');
                // Tutorial ends, enable interaction with door to start loop
            });
        });
    }

    update(time: number, delta: number): void {
        if (this.dialogManager.isActive() || this.minigameManager.isMinigameActive()) {
            this.minigameManager.update(time, delta);
            if (this.dialogManager.isActive()) this.dialogManager.handleInput(this.keys);
            return;
        }

        const input = this.getMovementInput();
        const interactPressed = Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E));

        this.player.update(input, delta);
        this.npcs.forEach(npc => npc.update(delta, this.player.getPosition()));

        // Interactions
        let nearTarget = false;

        // NPC -> Minigame Encounter
        this.npcs.forEach(npc => {
            if (Phaser.Math.Distance.BetweenPoints(this.player.getPosition(), npc.getPosition()) < 50) {
                nearTarget = true;
                this.interactionPrompt.setText(`[E] Sfida ${npc.getName()}`).setVisible(true);
                if (interactPressed) this.startEncounter(npc);
            }
        });

        // Doors -> Next Map
        if (!nearTarget) {
            const doors = this.mapManager.getDoors();
            doors.forEach(door => {
                if (Phaser.Math.Distance.Between(this.player.getPosition().x, this.player.getPosition().y,
                    door.x * TILE_SIZE * SCALE, door.y * TILE_SIZE * SCALE) < 50) {
                    nearTarget = true;
                    this.interactionPrompt.setText(`[E] ${door.label || 'Avanti'}`).setVisible(true);
                    if (interactPressed) this.handleDoor(door);
                }
            });
        }

        if (!nearTarget) this.interactionPrompt.setVisible(false);
    }

    private startEncounter(npc: NPC): void {
        this.player.freeze();
        this.interactionPrompt.setVisible(false);

        // 1. Dialogo Pre-Encounter (Placeholder o specifico)
        const dialogId = npc.getDialogId() || 'generic_intro';

        this.dialogManager.show(dialogId, () => {
            // 2. Start Random Minigame
            // Difficulty increases with Stage
            const difficulty = 1.0 + (this.stage * 0.2);

            MaskSystem.getInstance().updateTask(`SCONFIGGI ${npc.getName().toUpperCase()}`);

            this.minigameManager.startRandom(difficulty, (success) => {
                // 3. Post Minigame
                if (success) {
                    this.dialogManager.show('minigame_win', () => {
                        this.player.unfreeze();
                        // NPC Defeated? Disappear?
                        npc.setDefeated(true);
                        MaskSystem.getInstance().updateTask('TROVA L\'USCITA');
                    });
                } else {
                    this.dialogManager.show('minigame_loss', () => {
                        this.player.unfreeze();
                    });
                }
            });
        });
    }

    private handleDoor(door: DoorConfig): void {
        // Logica Endless:
        // Se siamo in Apartment, andiamo al Theater (avvio loop)
        // Se siamo nel loop, andiamo alla next map nel ciclo

        // In Endless Mode, ignoriamo il targetMap della porta e usiamo il ciclo
        let nextMap: MapKey = 'theater';

        if (this.currentMap === 'apartment') {
            nextMap = 'theater';
        } else {
            const currentIndex = this.MAP_CYCLE.findIndex(m => m === this.currentMap);
            const nextIndex = (currentIndex + 1) % this.MAP_CYCLE.length;
            nextMap = this.MAP_CYCLE[nextIndex];

            // Increment stage ONLY when completing a cycle (returning to Theater)
            if (nextIndex === 0) {
                this.stage++;
            }
        }

        this.transitionToMap(nextMap);
    }

    private transitionToMap(nextMap: MapKey): void {
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENES.GAME, {
                map: nextMap,
                stage: this.stage,
                // Coord placeholder, MapManager should handle spawns better ideally
                playerX: 100,
                playerY: 100
            });
        });
    }

    private setupNPCCollisions(): void {
        this.npcs.forEach(npc => this.physics.add.collider(this.player.getSprite(), npc.getSprite()));
    }
    private setupDoorTriggers(): void { }
    private setupCamera(w: number, h: number): void {
        this.cameras.main.setBounds(0, 0, w, h);
        this.cameras.main.startFollow(this.player.getSprite(), true, 0.1, 0.1);
    }
}
