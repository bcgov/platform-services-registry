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
AND  primary_cluster_name='klab2'
AND  profile.archived='false';

END TRANSACTION;