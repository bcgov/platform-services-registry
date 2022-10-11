BEGIN TRANSACTION;

UPDATE ref_cluster 
SET is_prod = true, is_default = false
WHERE name = 'emerald';

END TRANSACTION;