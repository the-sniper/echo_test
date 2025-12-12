-- Update testers table to have first_name, last_name, and optional email instead of just name
-- First add the new columns
ALTER TABLE testers ADD COLUMN first_name VARCHAR(255);
ALTER TABLE testers ADD COLUMN last_name VARCHAR(255);
ALTER TABLE testers ADD COLUMN email VARCHAR(255);

-- Migrate existing data: split name into first_name and last_name
UPDATE testers SET 
    first_name = SPLIT_PART(name, ' ', 1),
    last_name = CASE 
        WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
        ELSE ''
    END;

-- Make first_name and last_name required after migration
ALTER TABLE testers ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE testers ALTER COLUMN last_name SET NOT NULL;

-- Drop the old name column
ALTER TABLE testers DROP COLUMN name;

-- Add index on email for potential lookups
CREATE INDEX idx_testers_email ON testers(email);
