BEGIN TRANSACTION;

ALTER TABLE ref_quota
ADD COLUMN IF NOT EXISTS snapshot_volume smallint NOT NULL DEFAULT 5;


ALTER TABLE cluster_namespace
ADD COLUMN IF NOT EXISTS quota_snapshot_size varchar(16) REFERENCES ref_quota(id) DEFAULT 'small';


END TRANSACTION;