import Phaser from 'phaser';

/**
 * Centralized Audio Manager system.
 * Handles background music, sound effects, and volume settings.
 */
export class AudioManager {
    private static instance: AudioManager;
    private scene: Phaser.Scene;
    private music: Map<string, Phaser.Sound.BaseSound> = new Map();
    private currentMusic: string | null = null;
    private musicVolume: number = 0.5;
    private sfxVolume: number = 0.5;

    private constructor(scene: Phaser.Scene) {
        this.scene = scene;
        /* Load saved preferences if available */
        const savedMusic = localStorage.getItem('musicVolume');
        const savedSfx = localStorage.getItem('sfxVolume');
        if (savedMusic) this.musicVolume = parseFloat(savedMusic);
        if (savedSfx) this.sfxVolume = parseFloat(savedSfx);
    }

    public static getInstance(scene: Phaser.Scene): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager(scene);
        }
        return AudioManager.instance;
    }

    public init(scene: Phaser.Scene): void {
        this.scene = scene;
    }

    /**
     * Plays background music. Automatically fades out previous music if different.
     */
    public playMusic(key: string, loop: boolean = true): void {
        if (this.currentMusic === key) return;

        /* Check if the audio file exists */
        if (!this.scene.cache.audio.exists(key)) {
            console.warn(`Audio file not found: ${key}`);
            return;
        }

        /* Stop current music */
        if (this.currentMusic) {
            const current = this.music.get(this.currentMusic);
            if (current) {
                this.scene.tweens.add({
                    targets: current,
                    volume: 0,
                    duration: 1000,
                    onComplete: () => {
                        current.stop();
                    }
                });
            }
        }

        /* Start new music */
        let sound = this.music.get(key);
        if (!sound) {
            sound = this.scene.sound.add(key, { loop, volume: 0 });
            this.music.set(key, sound);
        }

        this.currentMusic = key;
        sound.play();
        this.scene.tweens.add({
            targets: sound,
            volume: this.musicVolume,
            duration: 1000
        });
    }

    /**
     * Stops current background music.
     */
    public stopMusic(): void {
        if (this.currentMusic) {
            const current = this.music.get(this.currentMusic);
            if (current) {
                this.scene.tweens.add({
                    targets: current,
                    volume: 0,
                    duration: 500,
                    onComplete: () => {
                        current.stop();
                        this.currentMusic = null;
                    }
                });
            }
        }
    }

    /**
     * Plays a sound effect once.
     */
    public playSFX(key: string, volume: number = this.sfxVolume): void {
        if (!this.scene.cache.audio.exists(key)) {
            return; /* Silently skip missing SFX */
        }
        try {
            this.scene.sound.play(key, { volume });
        } catch (e) {
            console.warn('SFX Error:', e);
        }
    }

    /**
     * Plays a procedural audio blip using Web Audio API.
     * Useful for character voices or UI feedback without external assets.
     */
    public playBlip(pitch: number = 440, type: OscillatorType = 'square', duration: number = 50): void {
        try {
            if (this.scene.sound instanceof Phaser.Sound.NoAudioSoundManager) return;

            const context = (this.scene.sound as Phaser.Sound.WebAudioSoundManager).context;
            if (!context) return;

            const osc = context.createOscillator();
            const gain = context.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(pitch, context.currentTime);

            /* Envelope */
            gain.gain.setValueAtTime(this.sfxVolume * 0.1, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);

            osc.connect(gain);
            gain.connect(context.destination);

            osc.start();
            osc.stop(context.currentTime + duration / 1000);
        } catch (e) {
            console.warn('Web Audio API not supported or error:', e);
        }
    }

    /**
     * Settings: Set Music Pitch/Rate
     */
    public setRate(value: number): void {
        if (this.currentMusic) {
            const current = this.music.get(this.currentMusic);
            if (current) {
                (current as any).setRate(value);
            }
        }
    }

    /**
     * Settings: Set Music Volume
     */
    public setMusicVolume(value: number): void {
        this.musicVolume = Phaser.Math.Clamp(value, 0, 1);
        localStorage.setItem('musicVolume', this.musicVolume.toString());

        if (this.currentMusic) {
            const current = this.music.get(this.currentMusic);
            if (current) {
                /* Update currently playing music volume immediately */
                (current as any).volume = this.musicVolume;
            }
        }
    }

    /**
     * Settings: Set SFX Volume
     */
    public setSFXVolume(value: number): void {
        this.sfxVolume = Phaser.Math.Clamp(value, 0, 1);
        localStorage.setItem('sfxVolume', this.sfxVolume.toString());
    }

    /**
     * Cleans up resources.
     */
    public destroy(): void {
        this.music.forEach(s => s.destroy());
        this.music.clear();
    }
}
