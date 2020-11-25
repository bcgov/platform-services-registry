
BEGIN TRANSACTION;

UPDATE cluster_namespace
  SET quota_cpu = 'small', quota_memory = 'small', quota_storage = 'small';

END TRANSACTION;