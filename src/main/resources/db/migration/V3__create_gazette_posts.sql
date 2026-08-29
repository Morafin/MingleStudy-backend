CREATE TABLE gazette_posts (
                               id BIGSERIAL PRIMARY KEY,
                               title VARCHAR(500) NOT NULL,
                               summary VARCHAR(700) NOT NULL,
                               source_name VARCHAR(120) NOT NULL,
                               source_url TEXT NOT NULL,
                               category VARCHAR(40) NOT NULL,
                               published_at TIMESTAMP WITH TIME ZONE,
                               fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dedupe key: the fetch job checks existsBySourceUrl before inserting, so this
-- unique index is what actually enforces "never store the same article twice"
-- under concurrent scheduler runs across Railway instances.
CREATE UNIQUE INDEX idx_gazette_posts_source_url ON gazette_posts (source_url);

-- Supports both the "all posts" and "posts filtered by category" feed queries,
-- newest first.
CREATE INDEX idx_gazette_posts_category_published ON gazette_posts (category, published_at DESC);