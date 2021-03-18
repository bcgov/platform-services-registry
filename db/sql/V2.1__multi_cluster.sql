BEGIN TRANSACTION;

ALTER TABLE profile ALTER COLUMN primary_cluster_name SET NOT NULL;

ALTER TABLE cluster_namespace
ALTER COLUMN quota_cpu_size SET NOT NULL,
ALTER COLUMN quota_memory_size SET NOT NULL,
ALTER COLUMN quota_storage_size SET NOT NULL,
DROP COLUMN IF EXISTS quota_cpu,
DROP COLUMN IF EXISTS quota_memory,
DROP COLUMN IF EXISTS quota_storage;

ALTER TABLE ref_cluster ADD COLUMN IF NOT EXISTS is_prod BOOLEAN NOT NULL DEFAULT true;
UPDATE ref_cluster SET is_prod = false WHERE name = 'clab' OR name = 'klab';

END TRANSACTION;
