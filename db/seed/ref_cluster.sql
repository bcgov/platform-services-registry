
BEGIN TRANSACTION;

INSERT INTO ref_cluster (name, disaster_recovery, on_prem, on_hardware, is_default) VALUES
  ('clab', false, true, false, false),
  ('klab', false, true, false, false),
  ('silver', false, true, true, true),
  ('gold', false, true, true, false),
  ('golddr', true, true, true, false),
  ('aro', false, false, false, false);

END TRANSACTION;