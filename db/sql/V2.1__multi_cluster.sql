BEGIN TRANSACTION;

ALTER TABLE profile ALTER COLUMN primary_cluster_name SET NOT NULL;

ALTER TABLE cluster_namespace
ALTER COLUMN quota_cpu_size SET NOT NULL,
ALTER COLUMN quota_memory_size SET NOT NULL,
ALTER COLUMN quota_storage_size SET NOT NULL,
DROP COLUMN IF EXISTS quota_cpu,
DROP COLUMN IF EXISTS quota_memory,
DROP COLUMN IF EXISTS quota_storage;

ALTER TABLE ref_cluster
ADD COLUMN IF NOT EXISTS is_prod BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS display_name VARCHAR(64);

UPDATE ref_cluster SET archived = true WHERE name = 'aro' OR name = 'golddr';
UPDATE ref_cluster SET is_prod = false WHERE name = 'clab' OR name = 'klab' OR name = 'klab2' OR name = 'gold' OR name = 'golddr';
UPDATE ref_cluster SET display_name = 'Silver Kamloops' WHERE name = 'silver';
UPDATE ref_cluster SET display_name = 'Gold Kamloops' WHERE name = 'gold';
UPDATE ref_cluster SET display_name = 'Gold (DR) Calgary' WHERE name = 'golddr';
UPDATE ref_cluster SET display_name = 'KLAB Kamloops' WHERE name = 'klab';
UPDATE ref_cluster SET display_name = 'CLAB Calgary' WHERE name = 'clab';

END TRANSACTION;
