BEGIN TRANSACTION;

CREATE OR REPLACE FUNCTION update_changetimestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP(3); 
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS ref_category (
    id          serial PRIMARY KEY,
    name        VARCHAR(32) NOT NULL,
    description VARCHAR(256) NOT NULL,
    created_at  timestamp DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  timestamp DEFAULT CURRENT_TIMESTAMP(3)
);

DROP TRIGGER IF EXISTS update_ref_category_changetimestamp on ref_category;
CREATE TRIGGER update_ref_category_changetimestamp BEFORE UPDATE
ON ref_category FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

CREATE TABLE IF NOT EXISTS ref_bus_org (
    code        varchar(4) PRIMARY KEY,
    name        varchar(64) NOT NULL,
    created_at  timestamp DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  timestamp DEFAULT CURRENT_TIMESTAMP(3)
);

DROP TRIGGER IF EXISTS update_ref_bus_org_changetimestamp on ref_bus_org;
CREATE TRIGGER update_ref_bus_org_changetimestamp BEFORE UPDATE
ON ref_bus_org FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

CREATE TABLE IF NOT EXISTS profile (
    id              serial PRIMARY KEY,
    name            varchar(40) NOT NULL,
    description     varchar(512),
    active          boolean NOT NULL DEFAULT true,
    critical_system boolean NOT NULL DEFAULT false,
    category        INTEGER REFERENCES ref_category(id) NOT NULL,
    bus_org_id      VARCHAR(4) REFERENCES ref_bus_org(code) NOT NULL,
    created_at      timestamp DEFAULT CURRENT_TIMESTAMP(3),
    updated_at      timestamp DEFAULT CURRENT_TIMESTAMP(3)
);

DROP TRIGGER IF EXISTS update_profile_changetimestamp on profile;
CREATE TRIGGER update_profile_changetimestamp BEFORE UPDATE
ON profile FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

END TRANSACTION;
