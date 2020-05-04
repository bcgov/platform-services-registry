BEGIN TRANSACTION;

CREATE OR REPLACE FUNCTION update_changetimestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP(3); 
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS profile (
    id          serial PRIMARY KEY,
    name        varchar(40) NOT NULL,
    description varchar(512),
    created_at  timestamp DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  timestamp DEFAULT CURRENT_TIMESTAMP(3)
);

DROP TRIGGER IF EXISTS update_profile_changetimestamp on profile;
CREATE TRIGGER update_profile_changetimestamp BEFORE UPDATE
ON profile FOR EACH ROW EXECUTE PROCEDURE 
update_changetimestamp_column();

END TRANSACTION;
