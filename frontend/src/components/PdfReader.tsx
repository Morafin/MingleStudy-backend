import { useEffect, useRef, useState } from "react";

type PdfReaderProps = {
    fileUrl: string;
    title: string;
};

const READY_CHECK_INTERVAL_MS = 400;
const READY_TIMEOUT_MS = 7000;
const MAX_AUTO_RETRIES = 2;

// The viewer is same-origin (served from our own /pdfjs/web/viewer.html), so we
// can reach into its window to check whether PDF.js actually finished loading
// the document. This lets us detect the "stuck blank" case and recover
// automatically instead of requiring the user to close and reopen the reader.
function isViewerReady(iframe: HTMLIFrameElement | null): boolean {
    try {
        const win = iframe?.contentWindow as (Window & { PDFViewerApplication?: any }) | null | undefined;
        const app = win?.PDFViewerApplication;
        return Boolean(app?.pdfViewer?.pagesCount);
    } catch {
        return false;
    }
}

export default function PdfReader({ fileUrl, title }: PdfReaderProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ready, setReady] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const attemptRef = useRef(0);

    // Fetch the PDF and create a same-origin blob URL (see earlier fix: the
    // viewer refuses cross-origin ?file= URLs for security reasons).
    useEffect(() => {
        let objectUrl: string | null = null;
        let cancelled = false;
        setBlobUrl(null);
        setError(null);
        setReady(false);
        attemptRef.current = 0;
        setIframeKey(0);

        fetch(fileUrl)
            .then((res) => {
                if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                return res.blob();
            })
            .then((blob) => {
                if (cancelled) return;
                objectUrl = URL.createObjectURL(blob);
                setBlobUrl(objectUrl);
            })
            .catch((e) => {
                if (!cancelled) setError((e as Error).message);
            });

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [fileUrl]);

    // Poll the (same-origin) viewer for readiness. If it hasn't finished loading
    // within READY_TIMEOUT_MS, force a fresh reload by remounting the iframe —
    // this is the automatic equivalent of closing and reopening the reader.
    useEffect(() => {
        if (!blobUrl) return;
        setReady(false);

        let settled = false;
        const intervalId = window.setInterval(() => {
            if (isViewerReady(iframeRef.current)) {
                settled = true;
                setReady(true);
                window.clearInterval(intervalId);
            }
        }, READY_CHECK_INTERVAL_MS);

        const timeoutId = window.setTimeout(() => {
            if (settled) return;
            window.clearInterval(intervalId);
            if (attemptRef.current < MAX_AUTO_RETRIES) {
                attemptRef.current += 1;
                setIframeKey((k) => k + 1);
            }
        }, READY_TIMEOUT_MS);

        return () => {
            window.clearInterval(intervalId);
            window.clearTimeout(timeoutId);
        };
    }, [blobUrl, iframeKey]);

    if (error) {
        return (
            <div className="pdf-reader-empty">
                <p className="subtitle">Couldn't load this PDF: {error}</p>
            </div>
        );
    }

    if (!blobUrl) {
        return (
            <div className="pdf-reader-loading">
                <div className="pdf-reader-spinner" />
                <p className="subtitle">Loading {title}…</p>
            </div>
        );
    }

    const viewerSrc = `/pdfjs/web/viewer.html?file=${encodeURIComponent(blobUrl)}`;

    return (
        <div className="pdf-reader-wrap">
            <iframe
                key={iframeKey}
                ref={iframeRef}
                src={viewerSrc}
                title={title}
                className="pdf-reader-iframe"
            />
            {!ready && (
                <div className="pdf-reader-overlay">
                    <div className="pdf-reader-spinner" />
                    <p className="subtitle">Loading {title}…</p>
                </div>
            )}
        </div>
    );
}