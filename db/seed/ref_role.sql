
BEGIN TRANSACTION;

INSERT INTO ref_role (name, description) VALUES
  ('Product Owner', 'The business owner of this product'),
  ('Technical Contact', 'Technical contact or DevOps specialist');

END TRANSACTION;