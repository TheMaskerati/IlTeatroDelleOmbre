/**
 * Visual Configuration
 * Centralizes all visual/aesthetic settings for the game.
 */

export const VISUALS = {
    COLORS: {
        AMBIENT: {
            THEATER: 0x1a0522, /* Deep Purple */
            NAPLES_ALLEY: 0x001133, /* Deep Blue */
            FATHER_HOUSE: 0x443322, /* Sepia */
            APARTMENT: 0x000000, /* Neutral/Dark */
            DEFAULT: 0x000000
        },
        PARTICLES: {
            GOLD: 0xffd700,
            RAIN: 0xaaddff,
            DEFAULT: 0xffffff
        },
        UI: {
            PROMPT_BG: '#000000ee',
            PROMPT_TEXT: '#ffd700',
            PROMPT_STROKE: '#000000'
        }
    },
    ATMOSPHERE: {
        THEATER: {
            alpha: 0.6,
            vignette: 0.5,
            dustFreq: 200
        },
        NAPLES_ALLEY: {
            alpha: 0.7,
            vignette: 0.7,
            rainFreq: 50
        },
        FATHER_HOUSE: {
            alpha: 0.4,
            vignette: 0.3
        },
        DEFAULT: {
            alpha: 0.2,
            vignette: 0
        }
    },
    SHADOW_TRAIL: {
        VELOCITY_THRESHOLD: 50,
        INTERVAL: 200,
        DURATION: 500,
        ALPHA: 0.3,
        SCALE: 1.1
    }
};
