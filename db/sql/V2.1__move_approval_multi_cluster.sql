BEGIN TRANSACTION;

ALTER TABLE profile ALTER COLUMN primary_cluster_name SET NOT NULL;

ALTER TABLE cluster_namespace
ALTER COLUMN quota_cpu_size SET NOT NULL,
ALTER COLUMN quota_memory_size SET NOT NULL,
ALTER COLUMN quota_storage_size SET NOT NULL,
DROP COLUMN IF EXISTS quota_cpu,
DROP COLUMN IF EXISTS quota_memory,
DROP COLUMN IF EXISTS quota_storage;

ALTER TABLE ref_cluster ADD COLUMN IF NOT EXISTS is_prod BOOLEAN NOT NULL DEFAULT false;

CREATE TYPE request_type AS ENUM ('create', 'edit');

ALTER TABLE request
ALTER COLUMN edit_type DROP NOT NULL,
ADD COLUMN IF NOT EXISTS type request_type,
ADD COLUMN IF NOT EXISTS context VARCHAR(512),
ADD COLUMN IF NOT EXISTS requires_human_action BOOLEAN,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES user_profile(id);

CREATE TYPE action_type AS ENUM ('comment_only', 'reject', 'approve');

CREATE TABLE IF NOT EXISTS human_action (
    id               SERIAL PRIMARY KEY,
    request_id       INTEGER REFERENCES request(id) NOT NULL,
    type             action_type NOT NULL,
    comment          VARCHAR(512),
    user_id          INTEGER REFERENCES user_profile(id) NOT NULL,
    archived         BOOLEAN NOT NULL DEFAULT false,
    created_at       timestamp DEFAULT CURRENT_TIMESTAMP(3),
    updated_at       timestamp DEFAULT CURRENT_TIMESTAMP(3)
);

DROP TRIGGER IF EXISTS update_human_action_changetimestamp on human_action;
CREATE TRIGGER update_human_action_changetimestamp BEFORE UPDATE
ON human_action FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

CREATE TABLE IF NOT EXISTS bot_message (
    id                  SERIAL PRIMARY KEY,
    request_id          INTEGER REFERENCES request(id) NOT NULL,
    nats_subject        VARCHAR(512) NOT NULL,
    nats_context        VARCHAR(4096) NOT NULL,
    cluster_name        VARCHAR(32) REFERENCES ref_cluster(name) NOT NULL,
    received_callback   BOOLEAN NOT NULL DEFAULT false,
    archived            BOOLEAN NOT NULL DEFAULT false,
    created_at          timestamp DEFAULT CURRENT_TIMESTAMP(3),
    updated_at          timestamp DEFAULT CURRENT_TIMESTAMP(3)
);

DROP TRIGGER IF EXISTS update_bot_message_changetimestamp on bot_message;
CREATE TRIGGER update_bot_message_changetimestamp BEFORE UPDATE
ON bot_message FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

END TRANSACTION;
