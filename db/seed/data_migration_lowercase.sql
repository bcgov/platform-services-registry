BEGIN TRANSACTION;

UPDATE contact
  SET github_id = lower(github_id), email = lower(email);

END TRANSACTION;
