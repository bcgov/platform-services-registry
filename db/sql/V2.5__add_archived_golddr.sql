BEGIN TRANSACTION;

UPDATE ref_cluster SET archived = false WHERE name = 'golddr';

END TRANSACTION;
