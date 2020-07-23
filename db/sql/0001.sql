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
    "default"         BOOLEAN NOT NULL DEFAULT false,
    archived          BOOLEAN NOT NULL DEFAULT false,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3),
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE            (name)
);

GRANT SELECT ON TABLE ref_cluster TO :ROLLNAME;

DROP TRIGGER IF EXISTS update_ref_cluster_changetimestamp on ref_cluster;
CREATE TRIGGER update_ref_cluster_changetimestamp BEFORE UPDATE
ON ref_cluster FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

CREATE TABLE IF NOT EXISTS ref_bus_org (
    id          varchar(4) PRIMARY KEY,
    name        varchar(64) NOT NULL,
    created_at  timestamp DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  timestamp DEFAULT CURRENT_TIMESTAMP(3)
);

GRANT SELECT ON TABLE ref_bus_org TO :ROLLNAME;

DROP TRIGGER IF EXISTS update_ref_bus_org_changetimestamp on ref_bus_org;
CREATE TRIGGER update_ref_bus_org_changetimestamp BEFORE UPDATE
ON ref_bus_org FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

CREATE TABLE IF NOT EXISTS user_profile (
    id              SERIAL PRIMARY KEY,
    keycloak_id     CHARACTER VARYING(36) NOT NULL,
    last_seen_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3),
    archived        BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_profile
TO :ROLLNAME;
GRANT USAGE ON SEQUENCE user_profile_id_seq
TO :ROLLNAME;

DROP TRIGGER IF EXISTS update_user_profile_changetimestamp on user_profile;
CREATE TRIGGER update_user_profile_changetimestamp BEFORE UPDATE
ON user_profile FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

CREATE TABLE IF NOT EXISTS profile (
    id               serial PRIMARY KEY,
    namespace_prefix varchar(8) NOT NULL,
    user_id          INTEGER REFERENCES user_profile(id) NOT NULL,
    name             varchar(40) NOT NULL,
    description      varchar(512),
    critical_system  boolean NOT NULL DEFAULT false,
    priority_system  boolean NOT NULL DEFAULT false,
    bus_org_id       VARCHAR(4) REFERENCES ref_bus_org(id) NOT NULL,
    archived         boolean NOT NULL DEFAULT false,
    created_at       timestamp DEFAULT CURRENT_TIMESTAMP(3),
    updated_at       timestamp DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE           (namespace_prefix)
);

CREATE UNIQUE INDEX IF NOT EXISTS namespace_prefix_idx ON profile (namespace_prefix);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profile
TO :ROLLNAME;
GRANT USAGE ON SEQUENCE profile_id_seq
TO :ROLLNAME;

DROP TRIGGER IF EXISTS update_profile_changetimestamp on profile;
CREATE TRIGGER update_profile_changetimestamp BEFORE UPDATE
ON profile FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

CREATE TABLE IF NOT EXISTS namespace (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(32) NOT NULL,
    profile_id  INTEGER REFERENCES profile(id) NOT NULL,
    archived    BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE      (name, archived)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE namespace
TO :ROLLNAME;
GRANT USAGE ON SEQUENCE namespace_id_seq
TO :ROLLNAME;

DROP TRIGGER IF EXISTS update_namespace_changetimestamp on namespace;
CREATE TRIGGER update_namespace_changetimestamp BEFORE UPDATE
ON namespace FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

CREATE TABLE IF NOT EXISTS cluster_namespace (
    id              SERIAL PRIMARY KEY,
    namespace_id    INTEGER REFERENCES namespace(id) NOT NULL,
    cluster_id      INTEGER REFERENCES ref_cluster(id) NOT NULL,
    provisioned     BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3),
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE cluster_namespace
TO :ROLLNAME;
GRANT USAGE ON SEQUENCE cluster_namespace_id_seq
TO :ROLLNAME;

DROP TRIGGER IF EXISTS update_cluster_namespace_changetimestamp on cluster_namespace;
CREATE TRIGGER update_cluster_namespace_changetimestamp BEFORE UPDATE
ON cluster_namespace FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

CREATE TABLE IF NOT EXISTS ref_role (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(32) NOT NULL,
    description       VARCHAR(256),
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3),
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3)
);

GRANT SELECT ON TABLE ref_role TO :ROLLNAME;

DROP TRIGGER IF EXISTS update_ref_role_changetimestamp on ref_role;
CREATE TRIGGER update_ref_role_changetimestamp BEFORE UPDATE
ON ref_role FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

CREATE TABLE IF NOT EXISTS contact (
    id          SERIAL PRIMARY KEY,
    first_name  VARCHAR(32) NOT NULL,
    last_name   VARCHAR(32) NOT NULL,
    email       VARCHAR(32) NOT NULL,
    github_id   VARCHAR(32),
    role_id     INTEGER REFERENCES ref_role(id) NOT NULL,
    archived    BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE contact
TO :ROLLNAME;
GRANT USAGE ON SEQUENCE contact_id_seq
TO :ROLLNAME;

DROP TRIGGER IF EXISTS update_contact_changetimestamp on contact;
CREATE TRIGGER update_contact_changetimestamp BEFORE UPDATE
ON contact FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

CREATE TABLE IF NOT EXISTS profile_contact (
    id          SERIAL PRIMARY KEY,
    profile_id  INTEGER REFERENCES profile(id) NOT NULL,
    contact_id  INTEGER REFERENCES contact(id) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP(3)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profile_contact
TO :ROLLNAME;
GRANT USAGE ON SEQUENCE profile_contact_id_seq
TO :ROLLNAME;

DROP TRIGGER IF EXISTS update_profile_contact_changetimestamp on profile_contact;
CREATE TRIGGER update_profile_contact_changetimestamp BEFORE UPDATE
ON profile_contact FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

END TRANSACTION;
