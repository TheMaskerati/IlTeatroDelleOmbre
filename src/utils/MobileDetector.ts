/**
 * Utility to detect if the game is running on a mobile device.
 * Used to enable touch controls and adjust UI layout.
 */
export class MobileDetector {
    /**
     * Checks if the user agent string indicates a mobile device.
     */
    static isMobile(): boolean {
        const ua = navigator.userAgent;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    }

    /**
     * Checks if the device supports touch events.
     */
    static isTouchDevice(): boolean {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * Returns true if either mobile UA or touch support is detected.
     */
    static shouldEnableMobileControls(): boolean {
        return this.isMobile() || this.isTouchDevice();
    }
}
