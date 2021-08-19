UPDATE profile
SET profile_status = 
  CASE 
    WHEN r.requires_human_action = true THEN 'pending_approval'::status_type
    WHEN r.is_active = true AND r.type = 'create' THEN 'approved'::status_type
    WHEN r.is_active = true AND r.type = 'edit' THEN 'pending_edit'::status_type
    ELSE 'provisioned'::status_type
  END
FROM request r
WHERE profile.id = r.profile_id AND r.is_active = true;