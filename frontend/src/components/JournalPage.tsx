import { useEffect, useMemo, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import Toast from "./Toast";
import type { JournalEntry } from "../data/journalApi";
import {
    useCreateJournalEntry,
    useDeleteJournalEntry,
    useJournalEntries,
    useTogglePinJournalEntry,
    useUpdateJournalEntry,
} from "../data/useJournalQueries";
import { haptics } from "../data/haptics";

type JournalPageProps = { initData: string };

const SWIPE_OPEN_OFFSET = -72;
const SWIPE_THRESHOLD = -44;
const SWIPE_MAX = -88;

function formatRowDate(iso: string): string {
    return new Date(iso).toLocaleDateString("default", { month: "short", day: "numeric" });
}

function formatEditorTimestamp(iso: string): string {
    return new Date(iso).toLocaleString("default", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function monthLabel(iso: string, referenceYear: number): string {
    const d = new Date(iso);
    const month = d.toLocaleDateString("default", { month: "long" });
    return d.getFullYear() === referenceYear ? month : `${month} ${d.getFullYear()}`;
}

function noteTitle(content: string): string {
    const firstLine = content.split("\n").find((l) => l.trim().length > 0);
    if (!firstLine) return "New Note";
    return firstLine.length > 60 ? `${firstLine.slice(0, 60)}…` : firstLine;
}

function notePreview(content: string): string {
    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    const rest = lines.slice(1).join(" ").trim();
    return rest.length > 80 ? `${rest.slice(0, 80)}…` : rest;
}

function sortEntries(list: JournalEntry[]): JournalEntry[] {
    return [...list].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
    });
}

function groupByMonth(list: JournalEntry[]) {
    const currentYear = new Date().getFullYear();
    const groups: { label: string; items: JournalEntry[] }[] = [];
    for (const entry of list) {
        const label = monthLabel(entry.updatedAt, currentYear);
        const last = groups[groups.length - 1];
        if (last && last.label === label) {
            last.items.push(entry);
        } else {
            groups.push({ label, items: [entry] });
        }
    }
    return groups;
}

function IconSearch() {
    return (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <line x1="20" y1="20" x2="15.3" y2="15.3" />
        </svg>
    );
}

function IconSidebar() {
    return (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
            <line x1="9.5" y1="4.5" x2="9.5" y2="19.5" />
        </svg>
    );
}

function IconCompose() {
    return (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
    );
}

function IconTrash() {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h16" />
            <path d="M9 7V4h6v3" />
            <path d="M6 7l1 13h10l1-13" />
        </svg>
    );
}

function IconChevronLeft() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
        </svg>
    );
}

function IconStar({ filled }: { filled: boolean }) {
    return (
        <svg viewBox="0 0 24 24" width="13" height="13" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8Z" />
        </svg>
    );
}

export default function JournalPage({ initData }: JournalPageProps) {
    const { data: rawEntries, isLoading: loading, error: fetchError } = useJournalEntries(initData);
    const entries = useMemo(() => sortEntries(rawEntries ?? []), [rawEntries]);

    const createMutation = useCreateJournalEntry(initData);
    const updateMutation = useUpdateJournalEntry(initData);
    const pinMutation = useTogglePinJournalEntry(initData);
    const deleteMutation = useDeleteJournalEntry(initData);

    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [content, setContent] = useState("");
    const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [mobileView, setMobileView] = useState<"list" | "editor">("list");
    const [showList, setShowList] = useState(true);

    // Swipe-to-delete state (mobile list rows)
    const [swipedRowId, setSwipedRowId] = useState<number | null>(null);
    const [dragDx, setDragDx] = useState(0);
    const touchStartX = useRef(0);
    const dragBaseline = useRef(0);
    const draggingId = useRef<number | null>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (fetchError) setError((fetchError as Error).message);
    }, [fetchError]);

    // Select the first note once entries have loaded, if nothing's selected yet.
    useEffect(() => {
        if (!initData || loading || selectedId != null || entries.length === 0) return;
        setSelectedId(entries[0].id);
        setContent(entries[0].content);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initData, loading, entries.length]);

    // Autosave the open note.
    useEffect(() => {
        if (!initData || loading || selectedId == null) return;
        const saved = entries.find((e) => e.id === selectedId)?.content ?? "";
        if (content === saved) return;

        setSaveState("saving");
        const timer = setTimeout(async () => {
            try {
                await updateMutation.mutateAsync({ id: selectedId, content });
                setSaveState("saved");
                haptics.success();
            } catch (e) {
                setError((e as Error).message);
                setSaveState("idle");
                haptics.error();
            }
        }, 800);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, selectedId]);

    const filteredEntries = useMemo(() => {
        if (!query.trim()) return entries;
        const q = query.trim().toLowerCase();
        return entries.filter((e) => e.content.toLowerCase().includes(q));
    }, [entries, query]);

    const pinnedEntries = useMemo(() => filteredEntries.filter((e) => e.pinned), [filteredEntries]);
    const unpinnedEntries = useMemo(() => filteredEntries.filter((e) => !e.pinned), [filteredEntries]);
    const groups = useMemo(() => groupByMonth(unpinnedEntries), [unpinnedEntries]);

    // Discard a note that was opened but never written into, so blank drafts don't pile up.
    async function discardIfEmpty(id: number | null) {
        if (id == null) return;
        const entry = entries.find((e) => e.id === id);
        if (entry && !entry.content.trim()) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch {
                // best-effort cleanup; ignore failures here
            }
        }
    }

    async function selectNote(id: number) {
        if (id === selectedId) { setMobileView("editor"); return; }
        await discardIfEmpty(selectedId);
        setSelectedId(id);
        setContent(entries.find((e) => e.id === id)?.content ?? "");
        setSaveState("idle");
        setMobileView("editor");
    }

    async function handleCompose() {
        haptics.tap("light");
        setError(null);
        await discardIfEmpty(selectedId);
        try {
            const created = await createMutation.mutateAsync(undefined);
            setSelectedId(created.id);
            setContent("");
            setSaveState("idle");
            setMobileView("editor");
        } catch (e) {
            console.error("Failed to create note:", e);
            setError((e as Error).message || "Couldn't create a new note. Try again.");
            haptics.error();
        }
    }

    async function handleBack() {
        await discardIfEmpty(selectedId);
        setMobileView("list");
    }

    async function handleDeleteNote(id: number) {
        if (!window.confirm("Delete this note?")) return;
        try {
            await deleteMutation.mutateAsync(id);
            const remaining = entries.filter((e) => e.id !== id);
            if (id === selectedId) {
                const next = remaining.length > 0 ? remaining[0].id : null;
                setSelectedId(next);
                setContent(next != null ? remaining.find((e) => e.id === next)?.content ?? "" : "");
                setSaveState("idle");
                setMobileView("list");
            }
            setSwipedRowId((cur) => (cur === id ? null : cur));
            setToastMessage("Note deleted");
            haptics.warning();
        } catch (e) {
            setError((e as Error).message);
            haptics.error();
        }
    }

    async function handleTogglePin(id: number, e?: MouseEvent) {
        e?.stopPropagation();
        haptics.tap("light");
        try {
            await pinMutation.mutateAsync(id);
        } catch (e) {
            setError((e as Error).message);
            haptics.error();
        }
    }

    function closeSwipe() {
        setSwipedRowId(null);
        setDragDx(0);
    }

    function handleTouchStart(id: number, e: TouchEvent) {
        touchStartX.current = e.touches[0].clientX;
        dragBaseline.current = swipedRowId === id ? SWIPE_OPEN_OFFSET : 0;
        draggingId.current = id;
        setDragDx(dragBaseline.current);
    }

    function handleTouchMove(id: number, e: TouchEvent) {
        if (draggingId.current !== id) return;
        const delta = e.touches[0].clientX - touchStartX.current;
        const next = Math.min(0, Math.max(dragBaseline.current + delta, SWIPE_MAX));
        const wasOpen = dragDx <= SWIPE_THRESHOLD;
        const nowOpen = next <= SWIPE_THRESHOLD;
        if (wasOpen !== nowOpen) haptics.selection(); // tiny tick as the swipe crosses the reveal threshold
        setDragDx(next);
    }

    function handleTouchEnd(id: number) {
        if (draggingId.current !== id) return;
        draggingId.current = null;
        if (dragDx <= SWIPE_THRESHOLD) {
            setSwipedRowId(id);
            setDragDx(SWIPE_OPEN_OFFSET);
        } else {
            setSwipedRowId(null);
            setDragDx(0);
        }
    }

    // Desktop keyboard shortcuts: ⌘N new note, ⌘F focus search, ⌘⌫ delete selected.
    useEffect(() => {
        if (!initData) return;

        function handleKeyDown(e: KeyboardEvent) {
            const mod = e.metaKey || e.ctrlKey;
            if (!mod) return;

            const key = e.key.toLowerCase();

            if (key === "n") {
                e.preventDefault();
                handleCompose();
                return;
            }

            if (key === "f") {
                e.preventDefault();
                searchInputRef.current?.focus();
                return;
            }

            if (e.key === "Backspace") {
                const active = document.activeElement;
                const isTyping = active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement;
                if (isTyping || selectedId == null) return;
                e.preventDefault();
                handleDeleteNote(selectedId);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initData, selectedId, entries]);

    const selectedEntry = entries.find((e) => e.id === selectedId) ?? null;

    function renderNoteRow(entry: JournalEntry) {
        const isSwiped = swipedRowId === entry.id;
        const liveDx = draggingId.current === entry.id ? dragDx : isSwiped ? SWIPE_OPEN_OFFSET : 0;

        return (
            <div key={entry.id} className="journal-row-wrapper">
                <button
                    type="button"
                    className="journal-swipe-delete"
                    onClick={() => handleDeleteNote(entry.id)}
                    aria-label="Delete note"
                >
                    <IconTrash />
                </button>
                <div
                    className={`journal-note-row ${entry.id === selectedId ? "selected" : ""}`}
                    style={{ transform: `translateX(${liveDx}px)` }}
                    onClick={() => (isSwiped ? closeSwipe() : selectNote(entry.id))}
                    onTouchStart={(e) => handleTouchStart(entry.id, e)}
                    onTouchMove={(e) => handleTouchMove(entry.id, e)}
                    onTouchEnd={() => handleTouchEnd(entry.id)}
                    role="button"
                    tabIndex={0}
                >
                    <button
                        type="button"
                        className={`journal-pin-star ${entry.pinned ? "pinned" : ""}`}
                        onClick={(e) => handleTogglePin(entry.id, e)}
                        aria-label={entry.pinned ? "Unpin note" : "Pin note"}
                    >
                        <IconStar filled={entry.pinned} />
                    </button>
                    <span className="journal-note-row-text">
                        <span className="journal-note-row-title">{noteTitle(entry.content)}</span>
                        <span className="journal-note-row-sub">
                            {formatRowDate(entry.updatedAt)}
                            {notePreview(entry.content) && `  ${notePreview(entry.content)}`}
                        </span>
                    </span>
                </div>
            </div>
        );
    }

    if (!initData) {
        return (
            <section className="journal-section">
                <div className="journal-window">
                    <p className="preview-banner">Open MingleStudy in Telegram to keep a private journal.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="journal-section">
            {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}

            <div className="journal-window">
                {/* macOS-style titlebar — desktop only */}
                <div className="journal-titlebar">
                    <div className="journal-toolbar-icons">
                        <button
                            type="button"
                            className="journal-icon-btn"
                            onClick={() => setShowList((v) => !v)}
                            aria-label="Toggle notes list"
                        >
                            <IconSidebar />
                        </button>
                        <button type="button" className="journal-icon-btn" onClick={handleCompose} aria-label="New note">
                            <IconCompose />
                        </button>
                        <button
                            type="button"
                            className="journal-icon-btn"
                            onClick={() => selectedId != null && handleDeleteNote(selectedId)}
                            disabled={selectedId == null}
                            aria-label="Delete note"
                        >
                            <IconTrash />
                        </button>
                    </div>
                    <div className="journal-search">
                        <IconSearch />
                        <input ref={searchInputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
                    </div>
                </div>

                {/* iOS-style nav — mobile only */}
                <div className={`journal-ios-nav ${mobileView === "editor" ? "is-editor" : ""}`}>
                    {mobileView === "editor" ? (
                        <>
                            <button type="button" className="journal-ios-back" onClick={handleBack}>
                                <IconChevronLeft />
                                Notes
                            </button>
                            <span className="ios-nav-status">
                                {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "\u00A0"}
                            </span>
                            <button
                                type="button"
                                className="journal-icon-btn"
                                onClick={() => selectedId != null && handleDeleteNote(selectedId)}
                                aria-label="Delete note"
                            >
                                <IconTrash />
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="ios-nav-title">Journal</span>
                            <button type="button" className="journal-icon-btn" onClick={handleCompose} aria-label="New note">
                                <IconCompose />
                            </button>
                        </>
                    )}
                </div>

                {error && <p className="journal-error-banner">{error}</p>}

                <div className="journal-body">
                    {/* ---------- Notes list pane ---------- */}
                    <div
                        className={`journal-list-pane ${mobileView === "editor" ? "mobile-hidden" : ""} ${!showList ? "journal-list-collapsed" : ""}`}
                        onClick={() => swipedRowId != null && closeSwipe()}
                    >
                        <div className="journal-mobile-search">
                            <IconSearch />
                            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
                        </div>

                        {loading && <p className="subtitle" style={{ padding: "16px" }}>Loading your journal…</p>}

                        {!loading && pinnedEntries.length === 0 && groups.length === 0 && (
                            <div className="calendar-empty-state">
                                <span className="empty-state-icon">📔</span>
                                <p className="subtitle" style={{ fontSize: "13px" }}>
                                    {query ? "No matching notes." : "No notes yet — tap the compose icon to write one."}
                                </p>
                            </div>
                        )}

                        {!loading && pinnedEntries.length > 0 && (
                            <div className="journal-month-group">
                                <p className="journal-month-label">Pinned</p>
                                {pinnedEntries.map((entry) => renderNoteRow(entry))}
                            </div>
                        )}

                        {!loading && groups.map((group) => (
                            <div key={group.label} className="journal-month-group">
                                <p className="journal-month-label">{group.label}</p>
                                {group.items.map((entry) => renderNoteRow(entry))}
                            </div>
                        ))}
                    </div>

                    {/* ---------- Editor pane ---------- */}
                    <div className={`journal-editor-pane ${mobileView === "list" ? "mobile-hidden" : ""}`}>
                        {selectedEntry ? (
                            <>
                                <span className="journal-editor-timestamp">
                                    {formatEditorTimestamp(selectedEntry.updatedAt)}
                                </span>
                                <textarea
                                    className="journal-textarea"
                                    value={content}
                                    maxLength={5000}
                                    placeholder="Start typing…"
                                    autoFocus
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </>
                        ) : (
                            <div className="journal-editor-empty">
                                <p className="subtitle">No Note Selected</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
