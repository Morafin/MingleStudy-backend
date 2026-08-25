import { useEffect, useState } from "react";
import { getBooks, type Book } from "../data/bookApi";
import { haptics } from "../data/haptics";
import PdfReader from "./PdfReader";

type LibraryPageProps = {
    initData: string;
};

function LibrarySkeleton() {
    return (
        <div className="ios-group">
            {[0, 1, 2].map((i) => (
                <div key={i} className="ios-row">
                    <div className="skeleton library-cover-skeleton" />
                    <div className="ios-row-main">
                        <div className="skeleton skeleton-line medium" />
                        <div className="skeleton skeleton-line short" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function IconBook() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </svg>
    );
}

function IconChevronRight() {
    return (
        <svg className="ios-row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
        </svg>
    );
}

function IconChevronDown() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

function groupByCategory(list: Book[]): { label: string; items: Book[] }[] {
    const groups = new Map<string, Book[]>();
    for (const book of list) {
        const label = book.category?.trim() || "Uncategorized";
        const existing = groups.get(label);
        if (existing) existing.push(book);
        else groups.set(label, [book]);
    }
    const entries = [...groups.entries()];
    entries.sort(([a], [b]) => {
        if (a === "Uncategorized") return 1;
        if (b === "Uncategorized") return -1;
        return a.localeCompare(b);
    });
    return entries.map(([label, items]) => ({ label, items }));
}

export default function LibraryPage({ initData }: LibraryPageProps) {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(Boolean(initData));
    const [error, setError] = useState<string | null>(null);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isReaderOpen, setIsReaderOpen] = useState(false);

    useEffect(() => {
        if (!initData) { setLoading(false); return; }
        setLoading(true);
        setError(null);
        getBooks(initData)
            .then(setBooks)
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
    }, [initData]);

    // Wire the Telegram hardware/back-gesture button to close the full-screen reader.
    // Cast to `any` here: the project's TelegramWebApp type doesn't declare BackButton,
    // but it exists on the real runtime object (window.Telegram.WebApp.BackButton).
    useEffect(() => {
        const webApp = window.Telegram?.WebApp as any;
        if (!webApp?.BackButton) return;

        if (isReaderOpen) {
            const handleBack = () => setIsReaderOpen(false);
            webApp.BackButton.show();
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
                webApp.BackButton.hide();
            };
        }
    }, [isReaderOpen]);

    function openBook(book: Book) {
        haptics.tap("light");
        setSelectedBook(book);
    }

    function closeBook() {
        setSelectedBook(null);
    }

    function openReader() {
        haptics.tap("light");
        setIsReaderOpen(true);
    }

    function closeReader() {
        setIsReaderOpen(false);
    }

    if (!initData) {
        return (
            <section className="library-section">
                <div className="section-heading">
                    <h2>Library</h2>
                </div>
                <p className="preview-banner">Open MingleStudy in Telegram to browse the library.</p>
            </section>
        );
    }

    const groups = groupByCategory(books);

    return (
        <section className="library-section">
            <div className="section-heading">
                <h2>Library</h2>
            </div>

            {loading && <LibrarySkeleton />}

            {!loading && error && <p className="form-error">Couldn't load the library: {error}</p>}

            {!loading && !error && books.length === 0 && (
                <div className="groups-empty-state">
                    <span className="empty-state-icon">📚</span>
                    <h3>No books yet</h3>
                    <p className="subtitle">Check back soon — we're adding useful study material here.</p>
                </div>
            )}

            {!loading && !error && groups.map((group) => (
                <div key={group.label}>
                    <p className="ios-group-label">{group.label}</p>
                    <div className="ios-group">
                        {group.items.map((book) => (
                            <button
                                key={book.id}
                                type="button"
                                className="ios-row library-row"
                                onClick={() => openBook(book)}
                            >
                                <div className="library-cover">
                                    {book.coverUrl ? (
                                        <img src={book.coverUrl} alt={book.title} />
                                    ) : (
                                        <IconBook />
                                    )}
                                </div>
                                <div className="ios-row-main">
                                    <span className="ios-row-title">{book.title}</span>
                                    <span className="ios-row-sub">{book.author}</span>
                                </div>
                                <IconChevronRight />
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {selectedBook && (
                <div className="ios-sheet-backdrop" onClick={closeBook}>
                    <div className="ios-sheet library-sheet" onClick={(e) => e.stopPropagation()}>
                        <div className="ios-sheet-navbar">
                            <button className="ios-sheet-nav-btn" onClick={closeBook}>
                                Close
                            </button>
                            <h3 className="ios-sheet-nav-title">{selectedBook.title}</h3>
                            <span className="ios-sheet-nav-btn" style={{ visibility: "hidden" }}>Close</span>
                        </div>

                        <div className="ios-sheet-body library-sheet-body">
                            <div className="library-detail-header">
                                <div className="library-cover library-cover-large">
                                    {selectedBook.coverUrl ? (
                                        <img src={selectedBook.coverUrl} alt={selectedBook.title} />
                                    ) : (
                                        <IconBook />
                                    )}
                                </div>
                                <div className="library-detail-meta">
                                    <span className="library-detail-title">{selectedBook.title}</span>
                                    <span className="subtitle">{selectedBook.author}</span>
                                    {selectedBook.category && (
                                        <span className="library-category-pill">{selectedBook.category}</span>
                                    )}
                                </div>
                            </div>

                            {selectedBook.description && (
                                <p className="library-description">{selectedBook.description}</p>
                            )}

                            {selectedBook.fileUrl ? (
                                <button type="button" className="library-read-btn" onClick={openReader}>
                                    <IconBook />
                                    Read Book
                                </button>
                            ) : (
                                <div className="library-reader-empty">
                                    <p className="subtitle">The full text isn't available yet — check back soon.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {selectedBook && selectedBook.fileUrl && (
                <div className={`library-reader-fullscreen ${isReaderOpen ? "is-open" : ""}`}>
                    <div className="library-reader-navbar">
                        <button className="library-reader-close" onClick={closeReader} aria-label="Close reader">
                            <IconChevronDown />
                        </button>
                        <div className="library-reader-navtext">
                            <span className="library-reader-title">{selectedBook.title}</span>
                            <span className="library-reader-subtitle">{selectedBook.author}</span>
                        </div>
                        <span className="library-reader-close" style={{ visibility: "hidden" }}>
                            <IconChevronDown />
                        </span>
                    </div>
                    <div className="library-reader-content">
                        {isReaderOpen && (
                            <PdfReader fileUrl={selectedBook.fileUrl} title={selectedBook.title} />
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}