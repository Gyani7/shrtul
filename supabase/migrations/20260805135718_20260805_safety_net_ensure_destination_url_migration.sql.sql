/*
# Safety net: ensure original_url is fully migrated to destination_url

## Purpose
On some databases the rename migration may not have applied correctly,
leaving the old `original_url` column and `links_original_url_not_empty`
constraint in place while the application sends `destination_url`. This
migration is idempotent and guarantees the schema matches the application
regardless of prior migration state.

## Changes
1. If `original_url` column exists, rename it to `destination_url`.
2. Drop the old `links_original_url_not_empty` constraint if it exists.
3. Ensure `links_destination_url_not_empty` constraint exists.
4. Backfill any NULL/empty destination_url values.

## Security
No RLS or policy changes. No data loss.
*/

-- Step 1: Rename original_url to destination_url if the old column still exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'links'
      AND column_name = 'original_url'
  ) THEN
    ALTER TABLE public.links RENAME COLUMN original_url TO destination_url;
  END IF;
END $$;

-- Step 2: Drop the old constraint if it still exists
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_original_url_not_empty;

-- Step 3: Ensure the new constraint exists
DO $$ BEGIN
  ALTER TABLE public.links ADD CONSTRAINT links_destination_url_not_empty
    CHECK (destination_url IS NOT NULL AND length(btrim(destination_url)) > 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Step 4: Backfill any NULL or empty destination_url values with a placeholder
-- This prevents existing rows from failing the new constraint.
UPDATE public.links
SET destination_url = 'https://example.com/migrated'
WHERE destination_url IS NULL OR btrim(destination_url) = '';

-- Step 5: Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
