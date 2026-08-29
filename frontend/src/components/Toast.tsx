import { useEffect } from "react";

type ToastProps = {
    message: string;
    onDismiss: () => void;
    // Optional action button (e.g. "Undo"). Clicking it fires onClick then dismisses.
    action?: { label: string; onClick: () => void };
    // How long the toast stays up before auto-dismissing, in ms. Defaults to the
    // original 2800ms; callers with an action (e.g. undo) should pass more time.
    duration?: number;
};

export default function Toast({ message, onDismiss, action, duration = 2800 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, duration);
        return () => clearTimeout(timer);
    }, [onDismiss, duration]);

    return (
        <div
            className="toast"
            role="status"
            style={{ "--toast-hold": `${Math.max(duration - 250, 0)}ms` } as React.CSSProperties}
        >
            <span className="toast-check">✓</span>
            {message}
            {action && (
                <button
                    type="button"
                    className="toast-action"
                    onClick={() => {
                        action.onClick();
                        onDismiss();
                    }}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
