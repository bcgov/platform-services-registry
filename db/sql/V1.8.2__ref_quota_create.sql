BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS ref_quota (
    id                  varchar(16) PRIMARY KEY,
    cpu_requests        smallint NOT NULL,
    cpu_limits          smallint NOT NULL,
    memory_requests     varchar(16) NOT NULL,
    memory_limits       varchar(16) NOT NULL,
    storage_block       varchar(16) NOT NULL,
    storage_file        varchar(16) NOT NULL,
    storage_backup      varchar(16) NOT NULL,
    storage_capacity    varchar(16) NOT NULL,
    created_at  timestamp DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  timestamp DEFAULT CURRENT_TIMESTAMP(3)
);

DROP TRIGGER IF EXISTS update_ref_quota_changetimestamp on ref_quota;
CREATE TRIGGER update_ref_quota_changetimestamp BEFORE UPDATE
ON ref_quota FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

INSERT INTO ref_quota (id, cpu_requests, cpu_limits, memory_requests, memory_limits, storage_block, storage_file, storage_backup, storage_capacity) VALUES
  ('small', 4, 8, '16Gi', '32Gi', '50Gi', '50Gi', '25Gi', '50Gi'),
  ('medium', 8, 16, '32Gi', '64Gi', '100Gi', '100Gi', '50Gi', '100Gi'),
  ('large', 32, 64, '64Gi', '128Gi', '200Gi', '200Gi', '100Gi', '200Gi')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE cluster_namespace
ADD COLUMN IF NOT EXISTS quota_cpu_size varchar(16) REFERENCES ref_quota(id) DEFAULT 'small',
ADD COLUMN IF NOT EXISTS quota_memory_size varchar(16) REFERENCES ref_quota(id)  DEFAULT 'small',
ADD COLUMN IF NOT EXISTS quota_storage_size varchar(16) REFERENCES ref_quota(id) DEFAULT 'small';

END TRANSACTION;
