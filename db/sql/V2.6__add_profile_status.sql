BEGIN TRANSACTION;

CREATE TYPE STATUS_TYPE AS ENUM ('pending_approval', 'approved', 'pending_edit', 'provisioned');

ALTER TABLE profile
ADD COLUMN IF NOT EXISTS profile_status STATUS_TYPE;

END TRANSACTION;
