import { useEffect, useState } from "react";
import { useGazettePosts } from "../data/useGazetteQueries";
import { formatCategoryLabel, formatPublishedAt, type GazettePost } from "../data/gazetteApi";

type GazettePageProps = {
  initData: string;
};

const CATEGORIES = ["STUDY_TIPS"];
const IFRAME_LOAD_TIMEOUT_MS = 6000;

function GazetteHero({ post, onOpen }: { post: GazettePost; onOpen: (post: GazettePost) => void }) {
  return (
      <button className="gazette-hero" onClick={() => onOpen(post)}>
        {post.imageUrl ? (
            <img className="gazette-hero-image" src={post.imageUrl} alt="" loading="lazy" />
        ) : (
            <div className="gazette-hero-fallback" />
        )}
        <div className="gazette-hero-scrim" />
        <div className="gazette-hero-content">
          <span className="gazette-hero-tag">{formatCategoryLabel(post.category)}</span>
          <h2 className="gazette-hero-title">{post.title}</h2>
          <div className="gazette-hero-meta">
            <span>{post.sourceName}</span>
            <span className="gazette-card-dot">.</span>
            <span>{formatPublishedAt(post.publishedAt)}</span>
          </div>
        </div>
      </button>
  );
}

function GazetteRow({ post, onOpen, isLast }: { post: GazettePost; onOpen: (post: GazettePost) => void; isLast: boolean }) {
  return (
      <button className={"gazette-row " + (isLast ? "gazette-row-last" : "")} onClick={() => onOpen(post)}>
        <div className="gazette-row-text">
          <span className="gazette-row-tag">{formatCategoryLabel(post.category)}</span>
          <h3 className="gazette-row-title">{post.title}</h3>
          <div className="gazette-row-meta">
            <span>{post.sourceName}</span>
            <span className="gazette-card-dot">.</span>
            <span>{formatPublishedAt(post.publishedAt)}</span>
          </div>
        </div>
        {post.imageUrl ? (
            <div className="gazette-row-thumb">
              <img src={post.imageUrl} alt="" loading="lazy" />
            </div>
        ) : (
            <div className="gazette-row-thumb gazette-row-thumb-fallback">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 002 2zm0 0a2 2 0 002-2V9a1 1 0 00-1-1h-3m-6 3h6m-6 4h6m-8-8h.01" />
              </svg>
            </div>
        )}
      </button>
  );
}

function GazetteSkeleton() {
  return (
      <div className="gazette-list">
        {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={"gazette-row " + (i === 5 ? "gazette-row-last" : "")}>
              <div className="gazette-row-text">
                <div className="skeleton skeleton-line short" style={{ width: 70 }} />
                <div className="skeleton skeleton-line full" />
                <div className="skeleton skeleton-line medium" style={{ marginTop: 4 }} />
              </div>
              <div className="skeleton skeleton-block gazette-row-thumb" />
            </div>
        ))}
      </div>
  );
}

function GazetteReaderSheet({ post, onClose }: { post: GazettePost | null; onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const [iframeState, setIframeState] = useState<"loading" | "loaded" | "blocked">("loading");

  useEffect(() => {
    if (!post) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    setIframeState("loading");
    const timeout = setTimeout(() => {
      setIframeState((current) => (current === "loading" ? "blocked" : current));
    }, IFRAME_LOAD_TIMEOUT_MS);

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  if (!post) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 180);
  };

  const blockedNote = post.sourceName + " does not allow embedded viewing. Opening in a new tab instead.";
  const openLabel = "Open on " + post.sourceName;

  return (
      <div className={"gazette-sheet-backdrop " + (closing ? "is-closing" : "")} onClick={handleClose}>
        <div className={"gazette-sheet " + (closing ? "is-closing" : "")} onClick={(e) => e.stopPropagation()}>
          <div className="gazette-sheet-handle" />

          <div className="gazette-sheet-header">
            <span className="gazette-sheet-title">{post.title}</span>
            <button className="gazette-sheet-close" onClick={handleClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="gazette-sheet-frame-wrap">
            {iframeState === "loading" && (
                <div className="gazette-sheet-loading">
                  <div className="gazette-sheet-spinner" />
                  <span>Loading article...</span>
                </div>
            )}

            {iframeState === "blocked" && (
                <div className="gazette-sheet-blocked">
                  <span className="gazette-sheet-tag">{formatCategoryLabel(post.category)}</span>
                  <h2 className="gazette-sheet-headline">{post.title}</h2>
                  <div className="gazette-sheet-meta">
                    <span>{post.sourceName}</span>
                    <span className="gazette-card-dot">.</span>
                    <span>{formatPublishedAt(post.publishedAt)}</span>
                  </div>
                  <p className="gazette-sheet-text">{post.teaser}</p>
                  <p className="gazette-sheet-blocked-note">{blockedNote}</p>
                  <a className="gazette-sheet-cta" href={post.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <span>{openLabel}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
            )}

            <iframe
                key={post.id}
                src={post.sourceUrl}
                title={post.title}
                className={"gazette-sheet-iframe " + (iframeState === "loaded" ? "is-visible" : "")}
                onLoad={() => setIframeState((current) => (current === "loading" ? "loaded" : current))}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
  );
}

export default function GazettePage({ initData }: GazettePageProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<GazettePost | null>(null);
  const { data: posts, isLoading, isError } = useGazettePosts(initData, activeCategory ?? undefined);

  const heroPost = posts && posts.length > 0 ? posts[0] : null;
  const restPosts = posts && posts.length > 1 ? posts.slice(1) : [];

  return (
      <div className="gazette-page">
        <div className="ios-group-label">Gazette</div>

        <div className="gazette-segmented">
          <button
              className={"gazette-segment " + (activeCategory === null ? "is-active" : "")}
              onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {CATEGORIES.map((category) => (
              <button
                  key={category}
                  className={"gazette-segment " + (activeCategory === category ? "is-active" : "")}
                  onClick={() => setActiveCategory(category)}
              >
                {formatCategoryLabel(category)}
              </button>
          ))}
        </div>

        {isLoading && (
            <>
              <div className="gazette-hero gazette-hero-skeleton">
                <div className="skeleton skeleton-block" style={{ height: "100%" }} />
              </div>
              <GazetteSkeleton />
            </>
        )}

        {isError && (
            <div className="gazette-empty">
              <p>Could not load the gazette right now. Pull to refresh or try again shortly.</p>
            </div>
        )}

        {!isLoading && !isError && posts && posts.length === 0 && (
            <div className="gazette-empty">
              <p>Nothing here yet. New posts land every few hours.</p>
            </div>
        )}

        {!isLoading && !isError && heroPost && (
            <GazetteHero post={heroPost} onOpen={setSelectedPost} />
        )}

        {!isLoading && !isError && restPosts.length > 0 && (
            <div className="gazette-list">
              {restPosts.map((post, index) => (
                  <GazetteRow
                      key={post.id}
                      post={post}
                      onOpen={setSelectedPost}
                      isLast={index === restPosts.length - 1}
                  />
              ))}
            </div>
        )}

        <GazetteReaderSheet post={selectedPost} onClose={() => setSelectedPost(null)} />
      </div>
  );
}
