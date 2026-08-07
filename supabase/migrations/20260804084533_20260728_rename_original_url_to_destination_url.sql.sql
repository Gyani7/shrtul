/*
# Rename links.original_url to links.destination_url

## Purpose
The production schema uses `destination_url` as the column name for the target URL
of a short link. This migration renames the column from `original_url` to
`destination_url` to match production, and updates the associated CHECK constraint.

## Changes
1. Renames column `links.original_url` → `links.destination_url` (NOT NULL, text).
   All existing data is preserved — this is a metadata-only rename.
2. Drops the old `links_original_url_not_empty` CHECK constraint.
3. Recreates the constraint as `links_destination_url_not_empty` referencing the
   new column name, ensuring destination_url is never NULL or empty.

## Security
No RLS policy changes. No new tables. No data loss.

## Notes
- `ALTER TABLE ... RENAME COLUMN` is safe and does not rewrite the table.
- All application code must be updated to use `destination_url` instead of
  `original_url` in the same deployment.
*/

ALTER TABLE links RENAME COLUMN original_url TO destination_url;

ALTER TABLE links DROP CONSTRAINT IF EXISTS links_original_url_not_empty;

DO $$ BEGIN
  ALTER TABLE links ADD CONSTRAINT links_destination_url_not_empty
    CHECK (destination_url IS NOT NULL AND length(btrim(destination_url)) > 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
