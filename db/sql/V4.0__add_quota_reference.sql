BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS ref_cpu_quota (
    id                  varchar(32) PRIMARY KEY,
    cpu_requests        real NOT NULL,
    cpu_limits          real NOT NULL,
    created_at  timestamp DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  timestamp DEFAULT CURRENT_TIMESTAMP(3)
);

DROP TRIGGER IF EXISTS update_ref_cpu_quota_changetimestamp on ref_cpu_quota;
CREATE TRIGGER update_ref_cpu_quota_changetimestamp BEFORE UPDATE
ON ref_cpu_quota FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

INSERT INTO ref_cpu_quota (id, cpu_requests, cpu_limits) VALUES
    ('cpu-request-0.5-limit-1.5', 0.5, 1.5),
    ('cpu-request-1-limit-2', 1, 2),
    ('cpu-request-2-limit-4', 2, 4),
    ('cpu-request-4-limit-8', 4, 8),
    ('cpu-request-8-limit-16', 8, 16),
    ('cpu-request-16-limit-32', 16, 32),
    ('cpu-request-32-limit-64', 32, 64)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS ref_memory_quota (
    id                  varchar(32) PRIMARY KEY,
    memory_requests     varchar(16) NOT NULL,
    memory_limits       varchar(16) NOT NULL,
    created_at  timestamp DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  timestamp DEFAULT CURRENT_TIMESTAMP(3)
);


DROP TRIGGER IF EXISTS update_ref_memory_quota_changetimestamp on ref_memory_quota;
CREATE TRIGGER update_ref_memory_quota_changetimestamp BEFORE UPDATE
ON ref_memory_quota FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();



INSERT INTO ref_memory_quota(id, memory_requests, memory_limits) VALUES
    ('memory-request-2-limit-4', 2, 4),
    ('memory-request-4-limit-8', 4, 8),
    ('memory-request-8-limit-16', 8, 16),
    ('memory-request-16-limit-32', 16, 32),
    ('memory-request-32-limit-64', 32, 64),
    ('memory-request-64-limit-128', 64, 32)
ON CONFLICT (id) DO NOTHING;


CREATE TABLE IF NOT EXISTS ref_storage_quota (
    id                  varchar(32) PRIMARY KEY,
    storage_block       varchar(16) NOT NULL,
    storage_file        varchar(16) NOT NULL,
    storage_backup      varchar(16) NOT NULL,
    storage_capacity    varchar(16) NOT NULL,
    storage_pvc_count   SMALLINT NOT NULL,
    snapshot_volume     SMALLINT NOT NULL DEFAULT 5,
    created_at  timestamp DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  timestamp DEFAULT CURRENT_TIMESTAMP(3)
);


DROP TRIGGER IF EXISTS update_ref_storage_quota_changetimestamp on ref_storage_quota;
CREATE TRIGGER update_ref_storage_quota_changetimestamp BEFORE UPDATE
ON ref_storage_quota FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();



INSERT INTO ref_storage_quota(id, storage_block, storage_file, storage_backup, storage_capacity, storage_pvc_count, snapshot_volume) VALUES
    ('storage-1', '1Gi','1Gi','512m','1Gi', 60, 5),
    ('storage-2', '2Gi','2Gi','1Gi','2Gi', 60, 5),
    ('storage-4', '4Gi','4Gi','2Gi','4Gi', 60, 5),
    ('storage-16', '16Gi','16Gi','8Gi','16Gi', 60, 5),
    ('storage-32', '32Gi','32Gi','16Gi','32Gi', 60, 5),
    ('storage-64', '64Gi','64Gi','32Gi','64Gi', 60, 5),
    ('storage-128', '128Gi','128Gi','64Gi','128Gi', 60, 5),
    ('storage-256', '256Gi','256Gi','128Gi','256Gi', 60, 5),
    ('storage-512', '512Gi','512Gi','256Gi','512Gi', 60, 5)
ON CONFLICT (id) DO NOTHING;

END TRANSACTION;