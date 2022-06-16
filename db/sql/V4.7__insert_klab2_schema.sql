BEGIN TRANSACTION;

INSERT INTO ref_cluster (name, disaster_recovery, on_prem, on_hardware, is_default) VALUES
  ('klab2', false, true, false, false),
ON CONFLICT (name) DO NOTHING;

ALTER TABLE ref_cluster
UPDATE ref_cluster SET display_name = 'KLAB2 Kamloops' WHERE name = 'klab2';

END TRANSACTION;
