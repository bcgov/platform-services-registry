BEGIN TRANSACTION;

UPDATE ref_cluster 
SET is_prod = true, SET is_default = false
WHERE name = 'emerald';

END TRANSACTION;