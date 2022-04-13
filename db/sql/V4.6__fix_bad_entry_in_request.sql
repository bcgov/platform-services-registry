BEGIN TRANSACTION;

UPDATE
    request
SET 
    is_active = false
WHERE 
    id = 886;

UPDATE
    request
SET 
    is_active = false
WHERE 
    id = 884;

UPDATE
    request
SET 
    is_active = false
WHERE 
    id = 888;

END TRANSACTION;