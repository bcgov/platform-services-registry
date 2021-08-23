BEGIN TRANSACTION;

UPDATE ref_cluster SET is_prod = true WHERE name = 'gold';
UPDATE ref_cluster SET display_name = 'Gold Hosting Tier' WHERE name = 'gold';
UPDATE ref_cluster SET display_name = 'Silver Hosting Tier' WHERE name = 'silver';

END TRANSACTION;