// Thin wrapper around Telegram's WebApp.HapticFeedback so call sites don't need to
// null-check window.Telegram every time. No-ops silently outside Telegram (browser preview).
type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type NotificationType = "error" | "success" | "warning";

interface HapticFeedbackApi {
    impactOccurred: (style: ImpactStyle) => void;
    notificationOccurred: (type: NotificationType) => void;
    selectionChanged: () => void;
}

function getHaptics(): HapticFeedbackApi | undefined {
    return (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: HapticFeedbackApi } } })
        .Telegram?.WebApp?.HapticFeedback;
}

export const haptics = {
    // Light tap — selection changes, toggling a filter, switching tabs
    selection(): void {
        getHaptics()?.selectionChanged();
    },
    // Light/medium physical impact — pin/unpin, opening a sheet, a button press with weight
    tap(style: ImpactStyle = "light"): void {
        getHaptics()?.impactOccurred(style);
    },
    // Save confirmed / action completed successfully
    success(): void {
        getHaptics()?.notificationOccurred("success");
    },
    // Destructive action completed (delete)
    warning(): void {
        getHaptics()?.notificationOccurred("warning");
    },
    // Something failed
    error(): void {
        getHaptics()?.notificationOccurred("error");
    },
};