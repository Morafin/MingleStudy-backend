CREATE TABLE todos (
                       id BIGSERIAL PRIMARY KEY,
                       telegram_id BIGINT NOT NULL,
                       text VARCHAR(300) NOT NULL,
                       completed BOOLEAN NOT NULL DEFAULT FALSE,
                       created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_todos_telegram_id_created_at ON todos (telegram_id, created_at);