BEGIN TRANSACTION;

UPDATE cluster_namespace
    SET quota_cpu_size = quota_cpu, quota_memory_size = quota_memory, quota_storage_size = quota_storage; 

END TRANSACTION;
