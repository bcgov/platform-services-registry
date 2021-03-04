GRANT SELECT ON TABLE ref_cluster TO ${username};

GRANT SELECT ON TABLE ref_bus_org TO ${username};

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_profile
TO ${username};
GRANT USAGE ON SEQUENCE user_profile_id_seq
TO ${username};

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profile
TO ${username};
GRANT USAGE ON SEQUENCE profile_id_seq
TO ${username};

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE namespace
TO ${username};
GRANT USAGE ON SEQUENCE namespace_id_seq
TO ${username};

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE cluster_namespace
TO ${username};
GRANT USAGE ON SEQUENCE cluster_namespace_id_seq
TO ${username};

GRANT SELECT ON TABLE ref_role TO ${username};

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE contact
TO ${username};
GRANT USAGE ON SEQUENCE contact_id_seq
TO ${username};

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profile_contact
TO ${username};
GRANT USAGE ON SEQUENCE profile_contact_id_seq
TO ${username};

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE request
TO ${username};
GRANT USAGE ON SEQUENCE request_id_seq
TO ${username};

GRANT SELECT ON TABLE ref_quota TO ${username};

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE human_action
TO ${username};
GRANT USAGE ON SEQUENCE human_action_id_seq
TO ${username};

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE bot_message
TO ${username};
GRANT USAGE ON SEQUENCE bot_message_id_seq
TO ${username};
