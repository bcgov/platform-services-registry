BEGIN TRANSACTION;

INSERT INTO ref_cluster (name, disaster_recovery, on_prem, on_hardware, is_default, is_prod, display_name) VALUES
  ('emerald', false, true, false, false, true, 'Emerald Hosting Tier')
ON CONFLICT (name) DO NOTHING;

END TRANSACTION;
