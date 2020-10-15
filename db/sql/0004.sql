BEGIN TRANSACTION;

ALTER TABLE profile RENAME COLUMN identity_management_site_minder TO idm_site_minder;
ALTER TABLE profile RENAME COLUMN identity_management_keycloak TO idm_keycloak;
ALTER TABLE profile RENAME COLUMN identity_management_active_dir to idm_active_dir;

END TRANSACTION;
