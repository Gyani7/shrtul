-- Add CHECK constraint to prevent empty-string original_url values
-- This is a safety net on top of the application-level validation.
-- The NOT NULL constraint already prevents NULL, but an empty string ''
-- could still slip through. This constraint blocks that edge case.

ALTER TABLE links
  ADD CONSTRAINT links_original_url_not_empty
  CHECK (original_url IS NOT NULL AND length(btrim(original_url)) > 0);

-- Add a comment documenting the constraint
COMMENT ON CONSTRAINT links_original_url_not_empty ON links IS
  'Prevents NULL or empty-string values in original_url. Application code must always send a valid URL.';
