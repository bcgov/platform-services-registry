BEGIN TRANSACTION;

ALTER TABLE cluster_namespace 
ADD COLUMN IF NOT EXISTS quota_cpu VARCHAR(8),
ADD COLUMN IF NOT EXISTS quota_memory VARCHAR(8),
ADD COLUMN IF NOT EXISTS quota_storage VARCHAR(8);

CREATE TABLE IF NOT EXISTS request (
    id               serial PRIMARY KEY,
    profile_id       INTEGER REFERENCES profile(id) NOT NULL,
    edit_type        varchar(40) NOT NULL,
    edit_object      varchar(4096),
    nats_subject     varchar(512),
    nats_context     varchar(4096),
    archived         BOOLEAN NOT NULL DEFAULT false,
    created_at       timestamp DEFAULT CURRENT_TIMESTAMP(3),
    updated_at       timestamp DEFAULT CURRENT_TIMESTAMP(3)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE request
TO :ROLLNAME;
GRANT USAGE ON SEQUENCE request_id_seq
TO :ROLLNAME;

DROP TRIGGER IF EXISTS update_ref_request_changetimestamp on request;
CREATE TRIGGER update_ref_request_changetimestamp BEFORE UPDATE
ON request FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

END TRANSACTION;
