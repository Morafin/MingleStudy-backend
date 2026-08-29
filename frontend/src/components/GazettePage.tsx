import { useState } from "react";
import { useGazettePosts } from "../data/useGazetteQueries";
import { formatCategoryLabel, formatPublishedAt, type GazettePost } from "../data/gazetteApi";

type GazettePageProps = {
    initData: string;
};

const CATEGORIES = ["STUDY_TIPS", "HIGHER_ED", "K12", "EDTECH"];

function GazetteCard({ post }: { post: GazettePost }) {
    return (
        <a className="gazette-card" href={post.sourceUrl} target="_blank" rel="noopener noreferrer">
            {post.imageUrl && (
                <div className="gazette-card-image">
                    <img src={post.imageUrl} alt="" loading="lazy" />
                </div>
            )}
            <div className="gazette-card-body">
                <span className="gazette-card-tag">{formatCategoryLabel(post.category)}</span>
                <h3 className="gazette-card-title">{post.title}</h3>
                <p className="gazette-card-teaser">{post.teaser}</p>
                <div className="gazette-card-meta">
                    <span className="gazette-card-source">{post.sourceName}</span>
                    <span className="gazette-card-dot">·</span>
                    <span className="gazette-card-time">{formatPublishedAt(post.publishedAt)}</span>
                </div>
            </div>
        </a>
    );
}

function GazetteSkeleton() {
    return (
        <div className="gazette-grid">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="gazette-card skeleton-card">
                    <div className="skeleton skeleton-block" style={{ height: 120 }} />
                    <div className="gazette-card-body">
                        <div className="skeleton skeleton-line short" />
                        <div className="skeleton skeleton-line full" />
                        <div className="skeleton skeleton-line medium" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function GazettePage({ initData }: GazettePageProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const { data: posts, isLoading, isError } = useGazettePosts(initData, activeCategory ?? undefined);

    return (
        <div className="gazette-page">
            <div className="ios-group-label">Gazette</div>

            <div className="gazette-filters">
                <button
                    className={`gazette-pill ${activeCategory === null ? "is-active" : ""}`}
                    onClick={() => setActiveCategory(null)}
                >
                    All
                </button>
                {CATEGORIES.map((category) => (
                    <button
                        key={category}
                        className={`gazette-pill ${activeCategory === category ? "is-active" : ""}`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {formatCategoryLabel(category)}
                    </button>
                ))}
            </div>

            {isLoading && <GazetteSkeleton />}

            {isError && (
                <div className="gazette-empty">
                    <p>Couldn't load the gazette right now. Pull to refresh or try again shortly.</p>
                </div>
            )}

            {!isLoading && !isError && posts && posts.length === 0 && (
                <div className="gazette-empty">
                    <p>Nothing here yet — new posts land every few hours.</p>
                </div>
            )}

            {!isLoading && !isError && posts && posts.length > 0 && (
                <div className="gazette-grid">
                    {posts.map((post) => (
                        <GazetteCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}