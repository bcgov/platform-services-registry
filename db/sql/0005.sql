BEGIN TRANSACTION;

CREATE OR REPLACE FUNCTION update_changetimestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP(3); 
  RETURN NEW;
END;
$$ language 'plpgsql';

ALTER TABLE cluster_namespace 
ADD COLUMN IF NOT EXISTS quota_cpu VARCHAR(8),
ADD COLUMN IF NOT EXISTS quota_memory VARCHAR(8),
ADD COLUMN IF NOT EXISTS quota_storage VARCHAR(8);

CREATE TABLE IF NOT EXISTS request (
    id               serial PRIMARY KEY,
    cluster_namespace_id INTEGER REFERENCES cluster_namespace(id) NOT NULL,
    nats_subject     varchar(40),
    nats_context     varchar(512),
    archived        BOOLEAN NOT NULL DEFAULT false,
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
