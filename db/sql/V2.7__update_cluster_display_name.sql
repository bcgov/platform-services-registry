BEGIN TRANSACTION;

UPDATE ref_cluster SET display_name = 'Silver Hosting Tier' WHERE name = 'silver';
UPDATE ref_cluster SET display_name = 'Gold Hosting Tier' WHERE name = 'gold';


END TRANSACTION;