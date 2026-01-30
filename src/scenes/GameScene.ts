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
import { AudioManager } from '@/systems/AudioManager';
import { HUD } from '@/ui/HUD';
import { KarmaSystem } from '@/systems/KarmaSystem';
import { TransitionManager } from '@/effects/TransitionManager';
import { TimeManager } from '@/systems/TimeManager';
import { VirtualJoystick } from '@/ui/VirtualJoystick';
import { SaveSystem } from '@/systems/SaveSystem';

interface GameSceneData {
    map?: MapKey;
    playerX?: number;
    playerY?: number;
    stage?: number; /* Traccia il round corrente */
}

/**
 * Main Game Scene
 * Handles the core gameplay loop including map loading, player movement,
 * NPC interactions, and transitioning between maps in Endless Mode.
 */
export class GameScene extends BaseScene {
    private player!: Player;
    private npcs: NPC[] = [];
    private currentMap!: MapKey;
    private mapManager!: MapManager;
    private dialogManager!: DialogManager;
    private minigameManager!: MinigameManager;
    private audioManager!: AudioManager;
    private hud!: HUD;
    private transitionManager!: TransitionManager;
    private interactionPrompt!: Phaser.GameObjects.Text;
    private mapNameText!: Phaser.GameObjects.Text;
    private joystick!: VirtualJoystick;

    private stage: number = 1;
    private static tutorialDone = false;

    /** Cycle of maps for Endless Mode progression */
    private readonly MAP_CYCLE: MapKey[] = ['theater', 'naplesAlley', 'fatherHouse'];

    public static resetState(): void {
        GameScene.tutorialDone = false;
    }

    constructor() {
        super(SCENES.GAME);
    }

    /**
     * Initializes the scene with data passed from other scenes.
     * @param data GameSceneData including current map, player position, and stage number.
     */
    init(data?: GameSceneData): void {
        super.init();
        this.currentMap = data?.map || 'apartment';
        this.stage = data?.stage || 1;
        this.npcs = [];
    }

    create(data?: GameSceneData): void {
        super.create();

        this.mapManager = new MapManager(this, this.currentMap);
        const { walls, mapWidth, mapHeight } = this.mapManager.create();

        const startPos = this.getStartPosition(data);

        if (!this.textures.exists('player')) {
            console.error('CRITICAL: Player texture missing in GameScene! Returning to BootScene.');
            this.scene.start(SCENES.BOOT);
            return;
        }

        this.player = new Player(this, startPos.x, startPos.y);

        this.createNPCs();
        this.createUI();

        this.dialogManager = new DialogManager(this);
        this.minigameManager = new MinigameManager(this);
        this.audioManager = AudioManager.getInstance(this);
        this.hud = new HUD(this);
        this.transitionManager = new TransitionManager(this);
        this.transitionManager.open();
        MaskSystem.getInstance().init(this);
        TimeManager.initialize(this);
        this.joystick = new VirtualJoystick(this);

        this.physics.add.collider(this.player.getSprite(), walls);
        this.setupNPCCollisions();
        this.setupDoorTriggers();
        this.setupCamera(mapWidth, mapHeight);

        if (this.currentMap === 'apartment' && !GameScene.tutorialDone) {
            this.startTutorial();
        } else {
            this.showMapName();
            MaskSystem.getInstance().updateTask('TROVA L\'USCITA');
        }

        this.setupAudio();
        this.setupPauseMenu();

        /* Day/Night Cycle Handling */
        TimeManager.onTimeChange((time) => {
            this.npcs.forEach(npc => npc.checkAvailability(time));
        });
        /* Initial check */
        this.npcs.forEach(npc => npc.checkAvailability(TimeManager.getCurrentTime()));
    }

    private setupAudio(): void {
        this.audioManager.playMusic(`bgm_${this.currentMap}`);

        /* Speed up music in later stages */
        if (this.stage > 1) {
            const rate = Math.min(1.0 + (this.stage - 1) * 0.05, 1.5);
            this.audioManager.setRate(rate);
        } else {
            this.audioManager.setRate(1.0);
        }
    }

    private setupPauseMenu(): void {
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch(SCENES.PAUSE);
        });
    }

    private getStartPosition(data?: GameSceneData): { x: number; y: number } {
        if (data?.playerX !== undefined && data?.playerY !== undefined) {
            return { x: data.playerX, y: data.playerY };
        }
        const defaults: Record<string, { x: number; y: number }> = {
            apartment: { x: 10 * TILE_SIZE * SCALE, y: 10 * TILE_SIZE * SCALE },
            theater: { x: 5 * TILE_SIZE * SCALE, y: 18 * TILE_SIZE * SCALE },
            naplesAlley: { x: 8 * TILE_SIZE * SCALE, y: 15 * TILE_SIZE * SCALE },
            fatherHouse: { x: 12 * TILE_SIZE * SCALE, y: 15 * TILE_SIZE * SCALE },
        };
        return defaults[this.currentMap] || { x: 100, y: 100 };
    }

    private createNPCs(): void {
        const npcIds = this.mapManager.getNPCIds();

        npcIds.forEach(id => {
            /* Semplificazione: Spawniamo solo se defined in ENEMIES */
            if (ENEMIES[id]) {
                const npc = new NPC(this, ENEMIES[id]);
                this.npcs.push(npc);
            }
        });
    }

    private createUI(): void {
        /* Prompt */
        this.interactionPrompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, '[E] INTERAGISCI', {
            fontFamily: 'monospace', fontSize: '20px', fontStyle: 'bold',
            color: '#ffd700', backgroundColor: '#000000ee', padding: { x: 16, y: 8 },
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(500).setVisible(false);

        /* Pulse Animation */
        this.tweens.add({
            targets: this.interactionPrompt,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        /* Map Name */
        this.mapNameText = this.add.text(GAME_WIDTH / 2, 30, '', {
            fontFamily: 'monospace', fontSize: '20px',
            color: '#ffd700', backgroundColor: '#000000aa', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(500).setAlpha(0);

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
            });
        });
    }

    update(time: number, delta: number): void {
        if (this.dialogManager.isActive() || this.minigameManager.isMinigameActive()) {
            this.minigameManager.update(time, delta);
            if (this.dialogManager.isActive()) this.dialogManager.handleInput(this.keys);
            return;
        }

        /* Input Handling (Keyboard + Mobile) */
        const input = this.getMovementInput();
        if (this.joystick && this.joystick.isActive()) {
            if (this.joystick.left) input.x = -1;
            if (this.joystick.right) input.x = 1;
            if (this.joystick.up) input.y = -1;
            if (this.joystick.down) input.y = 1;
        }

        const interactPressed = Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E));
        /* Mobile Touch Interaction (Simple tap on prompt region) */

        this.player.update(input, delta);
        this.npcs.forEach(npc => npc.update(delta, this.player.getPosition()));

        /* Interactions */
        let nearTarget = false;

        this.npcs.forEach(npc => {
            if (Phaser.Math.Distance.BetweenPoints(this.player.getPosition(), npc.getPosition()) < 50) {
                nearTarget = true;
                this.interactionPrompt.setText(`[E] Sfida ${npc.getName()}`).setVisible(true);
                if (interactPressed) this.startEncounter(npc);
            }
        });

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

        /* Visual Madness (Endless Mode) */
        if (this.stage > 3) {
            const madness = Math.min((this.stage - 3) * 0.05, 0.5); /* Cap madness */
            this.cameras.main.setRotation(Math.sin(time / 2000) * madness * 0.2);
            this.cameras.main.setZoom(1.0 + Math.sin(time / 1500) * madness * 0.1);

            if (this.stage > 7) {
                /* Color Tint Panic */
                const red = 255;
                const others = Math.floor(255 - (Math.sin(time / 500) * 50 * madness));
                this.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(red, others, others));
            }
        }

        /* Update HUD */
        if (this.hud) {
            this.hud.update({
                karma: KarmaSystem.getKarmaScore(),
                maskScore: MaskSystem.getInstance().getScore(),
                stage: this.stage,
                objective: MaskSystem.getInstance().getObjective()
            });
        }
    }

    private startEncounter(npc: NPC): void {
        this.player.freeze();
        this.interactionPrompt.setVisible(false);

        const dialogId = npc.getDialogId();
        this.dialogManager.show(dialogId, (action) => {
            /* Gestisce le azioni dalle scelte del dialogo */
            if (action?.includes('battle_') || action === 'start_minigame' || npc.isBoss()) {
                const difficulty = 1.0 + (this.stage * 0.2);

                /* Determina il tipo di minigame in base alla scelta */
                let minigameType: 'dodge' | 'timing' | 'mash' = 'dodge';

                if (action?.includes('_calm') || action?.includes('_peaceful')) {
                    minigameType = 'timing'; /* Approccio pacifico = timing preciso */
                } else if (action?.includes('_rage') || action?.includes('_aggressive')) {
                    minigameType = 'mash'; /* Approccio aggressivo = button mashing */
                } else {
                    minigameType = 'dodge'; /* Default = schivare */
                }

                MaskSystem.getInstance().updateTask(`SCONFIGGI ${npc.getName().toUpperCase()}`);

                this.minigameManager.start(minigameType, difficulty, (success) => {
                    if (success) {
                        /* Record Karma based on approach */
                        if (minigameType === 'timing') {
                            KarmaSystem.recordBattleAction('resist');
                        } else if (minigameType === 'mash') {
                            KarmaSystem.recordBattleAction('fight');
                        }

                        /* Determine Win Dialog */
                        let winDialogId = 'minigame_win';
                        if (npc.getId() === 'father_shadow') {
                            winDialogId = minigameType === 'timing' ? 'father_defeated_resist' : 'father_defeated_mask';
                        } else if (npc.getId() === 'dario') {
                            winDialogId = minigameType === 'timing' ? 'dario_defeated' : 'dario_victory_mask';
                        }

                        this.dialogManager.show(winDialogId, () => {
                            this.player.unfreeze();
                            npc.setDefeated(true);
                            SaveSystem.defeatBoss(npc.getId());
                            MaskSystem.getInstance().updateTask('TROVA L\'USCITA');
                        });
                    } else {
                        this.dialogManager.show('minigame_loss', () => {
                            this.player.unfreeze();
                        });
                    }
                });
            } else {
                this.player.unfreeze();
            }
        });
    }

    /**
     * Handles door interaction and map transitions.
     * In Endless Mode, this cycles through predefined maps.
     * @param door The door configuration interacting with.
     */
    private handleDoor(door: DoorConfig): void {
        const nextMap = door.targetMap;
        const targetX = door.targetX * TILE_SIZE * SCALE + (TILE_SIZE * SCALE) / 2;
        const targetY = door.targetY * TILE_SIZE * SCALE + (TILE_SIZE * SCALE) / 2;

        /* Increment stage if returning to Theater from the last map in the cycle */
        /* Cycle: theater -> naplesAlley -> fatherHouse -> naplesAlley -> theater */
        /* If we are entering theater and we are not coming from apartment */
        if (nextMap === 'theater' && this.currentMap !== 'apartment') {
            this.stage++;
        }

        /* Check for Ending Condition */
        if (this.currentMap === 'fatherHouse' && SaveSystem.isBossDefeated('father_shadow')) {
            this.scene.start(SCENES.ENDING);
            return;
        }

        this.transitionToMap(nextMap, targetX, targetY);
    }

    private transitionToMap(nextMap: MapKey, x: number, y: number): void {
        TimeManager.advanceTime();
        this.transitionManager.close().then(() => {
            this.scene.start(SCENES.GAME, {
                map: nextMap,
                stage: this.stage,
                playerX: x,
                playerY: y
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
