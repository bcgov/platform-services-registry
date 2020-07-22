
BEGIN TRANSACTION;

INSERT INTO ref_cluster (name, disaster_recovery, on_prem, default) VALUES
  ('kam', false, true, true),
  ('cal', true, true, false),
  ('az1', false, false, false);

END TRANSACTION;