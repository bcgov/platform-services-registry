BEGIN TRANSACTION;

UPDATE profile
  SET primary_cluster_name = (SELECT name FROM ref_cluster WHERE is_default = true LIMIT 1);

END TRANSACTION;
