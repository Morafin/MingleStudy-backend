import { useEffect, useState } from "react";
import Toast from "./Toast";
import { deleteJournalEntry, getMyJournalEntries, saveJournalEntry, type JournalEntry } from "../data/journalApi";

type JournalPageProps = { initData: string };

function formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateKey: string): string {
    const [y, m, d] = dateKey.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("default", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

export default function JournalPage({ initData }: JournalPageProps) {
    const todayKey = formatDateKey(new Date());

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(Boolean(initData));
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(todayKey);
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!initData) { setLoading(false); return; }
        setLoading(true);
        getMyJournalEntries(initData)
            .then(setEntries)
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
    }, [initData]);

    // Keep the editor in sync with whichever date is selected, once entries have loaded.
    useEffect(() => {
        const existing = entries.find((e) => e.date === selectedDate);
        setContent(existing?.content ?? "");
    }, [selectedDate, entries]);

    const handleSave = async () => {
        if (!content.trim()) { setError("Write something before saving."); return; }
        setSaving(true);
        setError(null);
        try {
            const saved = await saveJournalEntry(initData, { date: selectedDate, content: content.trim() });
            setEntries((prev) => {
                const rest = prev.filter((e) => e.date !== saved.date);
                return [saved, ...rest].sort((a, b) => b.date.localeCompare(a.date));
            });
            setToastMessage("Entry saved ✓");
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (entry: JournalEntry) => {
        try {
            await deleteJournalEntry(initData, entry.id);
            setEntries((prev) => prev.filter((e) => e.id !== entry.id));
            if (entry.date === selectedDate) setContent("");
        } catch (e) {
            setError((e as Error).message);
        }
    };

    if (!initData) {
        return (
            <section className="journal-section">
                <div className="section-heading">
                    <h2>Journal</h2>
                </div>
                <p className="preview-banner">Open MingleStudy in Telegram to keep a private journal.</p>
            </section>
        );
    }

    const pastEntries = entries.filter((e) => e.date !== selectedDate);

    return (
        <section className="journal-section">
            {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}

            <div className="section-heading">
                <h2>Journal</h2>
            </div>

            <div className="journal-editor-card">
                <p className="ios-group-label">{formatDisplayDate(selectedDate)}</p>
                <textarea
                    className="journal-textarea"
                    value={content}
                    maxLength={5000}
                    placeholder="What's on your mind today?"
                    onChange={(e) => setContent(e.target.value)}
                />
                {error && <p className="form-error">{error}</p>}
                <div className="journal-editor-actions">
                    {selectedDate !== todayKey && (
                        <button
                            type="button"
                            className="btn-secondary bubble-button"
                            onClick={() => setSelectedDate(todayKey)}
                        >
                            Back to today
                        </button>
                    )}
                    <button type="button" className="btn-primary bubble-button" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving…" : "Save entry"}
                    </button>
                </div>
            </div>

            {loading && <p className="subtitle">Loading your journal…</p>}

            {!loading && pastEntries.length > 0 && (
                <>
                    <p className="ios-group-label">Past entries</p>
                    <div className="ios-group">
                        {pastEntries.map((entry) => (
                            <div
                                key={entry.id}
                                className="ios-row journal-entry-row"
                                onClick={() => setSelectedDate(entry.date)}
                            >
                                <div className="ios-row-main">
                                    <span className="ios-row-title">{formatDisplayDate(entry.date)}</span>
                                    <span className="ios-row-sub">{entry.content}</span>
                                </div>
                                <button
                                    type="button"
                                    className="delete-event-btn"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(entry); }}
                                    aria-label="Delete entry"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {!loading && entries.length === 0 && (
                <div className="calendar-empty-state">
                    <span className="empty-state-icon">📔</span>
                    <p className="subtitle" style={{ fontSize: "13px" }}>
                        No entries yet — write your first one above.
                    </p>
                </div>
            )}
        </section>
    );
}