import { useEffect } from "react";

type ToastProps = {
    message: string;
    onDismiss: () => void;
};

export default function Toast({ message, onDismiss }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 2800);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="toast" role="status">
            <span className="toast-check">✓</span>
            {message}
        </div>
    );
}