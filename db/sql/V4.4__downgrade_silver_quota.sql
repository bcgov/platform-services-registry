BEGIN TRANSACTION;

UPDATE
    cluster_namespace
SET 
    quota_memory_size = 'memory-request-8-limit-16',
    quota_cpu_size = 'cpu-request-2-limit-4'
FROM
    profile
    INNER JOIN namespace ON profile.id = namespace.profile_id
WHERE 
namespace.id = cluster_namespace.namespace_id
AND namespace.name ~ '^[a-zA-Z0-9]*-tools' 
AND primary_cluster_name='silver'
AND profile.archived='false'
AND profile.namespace_prefix ~* '^(?!75e61b|8878b4|77c02f|0bd5ad|8ad0ea).*';

END TRANSACTION;