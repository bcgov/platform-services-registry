BEGIN TRANSACTION;

WITH dups AS
(
  SELECT id,
  ROW_NUMBER() OVER(PARTITION BY name ORDER BY id ASC) rn
  FROM profile
)
UPDATE profile
SET    name = name || case when dups.rn = 1 then '' else (dups.rn-1)::text end
FROM   dups
WHERE  dups.id = profile.id;

END TRANSACTION;
