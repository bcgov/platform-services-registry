BEGIN TRANSACTION;

ALTER TABLE profile 
ADD COLUMN IF NOT EXISTS primary_cluster_name VARCHAR(32) REFERENCES ref_cluster(name);

END TRANSACTION;
