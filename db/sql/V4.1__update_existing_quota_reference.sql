BEGIN TRANSACTION;

ALTER TABLE 
  cluster_namespace 
DROP 
  CONSTRAINT cluster_namespace_quota_snapshot_size_fkey, 
DROP 
  CONSTRAINT cluster_namespace_quota_storage_size_fkey, 
DROP 
  CONSTRAINT cluster_namespace_quota_memory_size_fkey, 
DROP 
  CONSTRAINT cluster_namespace_quota_cpu_size_fkey, 
ALTER COLUMN quota_cpu_size TYPE varchar(32), 
ALTER COLUMN quota_memory_size TYPE varchar(32);

UPDATE 
  cluster_namespace 
SET 
  quota_cpu_size = (
    CASE WHEN quota_cpu_size = 'small' THEN 'cpu-request-4-limit-8' WHEN quota_cpu_size = 'medium' THEN 'cpu-request-8-limit-16' WHEN quota_cpu_size = 'large' THEN 'cpu-request-16-limit-32' ELSE quota_cpu_size END
  ), 
  quota_memory_size = (
    CASE WHEN quota_memory_size = 'small' THEN 'memory-request-16-limit-32' WHEN quota_memory_size = 'medium' THEN 'memory-request-32-limit-64' WHEN quota_memory_size = 'large' THEN 'memory-request-64-limit-128' ELSE quota_memory_size END
  ), 
  quota_storage_size = (
    CASE WHEN quota_storage_size = 'small' THEN 'storage-64' WHEN quota_storage_size = 'medium' THEN 'storage-128' WHEN quota_storage_size = 'large' THEN 'storage-256' ELSE quota_storage_size END
  ), 
  quota_snapshot_size = (
    CASE WHEN quota_snapshot_size = 'small' THEN 'snapshot-5' ELSE quota_snapshot_size END
  );

ALTER TABLE 
  cluster_namespace 
ADD 
  CONSTRAINT "cluster_namespace_quota_cpu_size_rkey" FOREIGN KEY (quota_cpu_size) REFERENCES ref_cpu_quota(id), 
ADD 
  CONSTRAINT "cluster_namespace_quota_memory_size_rkey" FOREIGN KEY (quota_memory_size) REFERENCES ref_memory_quota(id), 
ADD 
  CONSTRAINT "cluster_namespace_quota_storage_size_rkey" FOREIGN KEY (quota_storage_size) REFERENCES ref_storage_quota(id), 
ADD 
  CONSTRAINT "cluster_namespace_quota_snapshot_size_rkey" FOREIGN KEY (quota_snapshot_size) REFERENCES ref_snapshot_quota(id), 
  ALTER COLUMN quota_cpu_size 
SET 
  DEFAULT 'cpu-request-0.5-limit-1.5', 
  ALTER COLUMN quota_memory_size 
SET 
  DEFAULT 'memory-request-2-limit-4', 
  ALTER COLUMN quota_storage_size 
SET 
  DEFAULT 'storage-1', 
  ALTER COLUMN quota_snapshot_size 
SET 
  DEFAULT 'snapshot-5';

END TRANSACTION;
