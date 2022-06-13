
BEGIN TRANSACTION;

INSERT INTO ref_bus_org (id, name) VALUES
  ('AEST', 'Advanced Education, Skills & Training'),
  ('AGRI', 'Agriculture'),
  ('ALC', 'Agriculture Land Commission'),
  ('AG', 'Attorney General'),
  ('MCF', 'Children & Family Development'),
  ('CITZ', 'Citizens'' Services'),
  ('DBC', 'Destination BC'),
  ('EMBC', 'Emergency Management BC'),
  ('EAO', 'Environmental Assessment Office'),
  ('EDUC', 'Education'),
  ('EMPR', 'Energy, Mines & Petroleum Resources'),
  ('ENV', 'Environment & Climate Change Strategy'),
  ('FIN', 'Finance'),
  ('FLNR', 'Forests, Lands, Natural Resource Operations & Rural Development'),
  ('HLTH', 'Health'),
  ('IRR', 'Indigenous Relations & Reconciliation'),
  ('JEDC', 'Jobs, Economic Development & Competitiveness'),
  ('LBR', 'Labour Policy & Legislation'),
  ('LDB', 'BC Liquor Distribution Branch'),
  ('MMHA', 'Mental Health & Addictions'),
  ('MAH', 'Municipal Affairs & Housing'),
  ('BCPC', 'Pension Corporation'),
  ('PSA', 'Public Service Agency'),
  ('PSSG', 'Public Safety & Solicitor General'),
  ('SDPR', 'Social Development & Poverty Reduction'),
  ('TCA', 'Tourism, Arts & Culture'),
  ('TRAN', 'Transportation & Infrastructure')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ref_cluster (name, disaster_recovery, on_prem, on_hardware, is_default) VALUES
  ('clab', false, true, false, false),
  ('klab', false, true, false, false),
  ('klab2', false, true, false, false),
  ('silver', false, true, true, true),
  ('gold', false, true, true, false),
  ('golddr', true, true, true, false),
  ('aro', false, false, false, false)
ON CONFLICT (name) DO NOTHING;

INSERT INTO ref_role (name, description) VALUES
  ('Product Owner', 'The business owner of this product'),
  ('Technical Contact', 'Technical contact or DevOps specialist')
ON CONFLICT (name) DO NOTHING;

END TRANSACTION;
