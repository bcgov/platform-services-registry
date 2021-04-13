BEGIN TRANSACTION;

UPDATE ref_quota
SET cpu_requests = 16, cpu_limits = 32
WHERE id = 'large';

END TRANSACTION;
