BEGIN TRANSACTION;

CREATE OR REPLACE FUNCTION update_changetimestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP(3); 
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS ref_cluster (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(32) NOT NULL,
    description       VARCHAR(256),
    disaster_recovery BOOLEAN NOT NULL,
    on_prem           BOOLEAN NOT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3),
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3)
);

GRANT SELECT ON TABLE ref_cluster TO :ROLLNAME;

DROP TRIGGER IF EXISTS update_ref_cluster_changetimestamp on ref_cluster;
CREATE TRIGGER update_ref_cluster_changetimestamp BEFORE UPDATE
ON ref_cluster FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

CREATE TABLE IF NOT EXISTS namespace (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(32) NOT NULL,
    profile_id  INTEGER REFERENCES profile(id) NOT NULL,
    cluster_id  INTEGER REFERENCES ref_cluster(id) NOT NULL,
    archived    BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE      (name, cluster_id, archived)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE namespace
TO :ROLLNAME;
GRANT USAGE ON SEQUENCE namespace_id_seq
TO :ROLLNAME;

DROP TRIGGER IF EXISTS update_namespace_changetimestamp on namespace;
CREATE TRIGGER update_namespace_changetimestamp BEFORE UPDATE
ON namespace FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

CREATE TABLE IF NOT EXISTS ref_category (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(32) NOT NULL,
    description VARCHAR(256) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3)
);

GRANT SELECT ON TABLE ref_category TO :ROLLNAME;

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

GRANT SELECT ON TABLE ref_bus_org TO :ROLLNAME;

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
    archived        boolean NOT NULL DEFAULT false,
    created_at      timestamp DEFAULT CURRENT_TIMESTAMP(3),
    updated_at      timestamp DEFAULT CURRENT_TIMESTAMP(3)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profile
TO :ROLLNAME;
GRANT USAGE ON SEQUENCE profile_id_seq
TO :ROLLNAME;

DROP TRIGGER IF EXISTS update_profile_changetimestamp on profile;
CREATE TRIGGER update_profile_changetimestamp BEFORE UPDATE
ON profile FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

END TRANSACTION;
