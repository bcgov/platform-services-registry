BEGIN TRANSACTION;

INSERT INTO ref_cluster (name, disaster_recovery, on_prem, on_hardware, is_default, is_prod, display_name) VALUES
  ('klab2', false, true, false, false, false, 'KLAB2 Kamloops')
ON CONFLICT (name) DO NOTHING;

END TRANSACTION;
