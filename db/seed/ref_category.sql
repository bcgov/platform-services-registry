
BEGIN TRANSACTION;

INSERT INTO ref_category (name, description) VALUES
  ('pathfinder', 'An experamental project where the outcome or success is unclear'),
  ('operational', 'A project where the outcome is well understood');

END TRANSACTION;