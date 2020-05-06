
BEGIN TRANSACTION;

INSERT INTO ref_cluster (name, disaster_recovery, on_prem) VALUES
  ('kam', false, true),
  ('cal', true, true),
  ('az1', false, false);

END TRANSACTION;