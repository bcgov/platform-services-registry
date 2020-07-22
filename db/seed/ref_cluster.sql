
BEGIN TRANSACTION;

clab, klab, thetis (clabs temp name), silver, gold, golddr,and platform-services (aro)

INSERT INTO ref_cluster (name, disaster_recovery, on_prem, on_hardware, default) VALUES
  ('clab', false, true, false, false),
  ('klab', false, true, false, false),
  ('silver', false, true, true, true),
  ('gold', false, true, true, false),
  ('golddr', true, true, true, false),
  ('aro', false, false, false, false);

END TRANSACTION;