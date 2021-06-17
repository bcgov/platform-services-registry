BEGIN TRANSACTION;

ALTER TABLE ref_quota
ADD COLUMN IF NOT EXISTS storage_pvc_count SMALLINT;

UPDATE ref_quota SET storage_pvc_count = 20 WHERE id = 'small';
UPDATE ref_quota SET storage_pvc_count = 40 WHERE id = 'medium';
UPDATE ref_quota SET storage_pvc_count = 60 WHERE id = 'large';

ALTER TABLE ref_quota ALTER COLUMN storage_pvc_count SET NOT NULL;

END TRANSACTION;
