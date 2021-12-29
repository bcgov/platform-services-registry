BEGIN TRANSACTION;

UPDATE ref_storage_quota
SET storage_backup = '512Mi' where id = 'storage-1';

END TRANSACTION;