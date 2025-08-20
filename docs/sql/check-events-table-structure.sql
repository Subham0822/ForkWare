-- Check the current structure of the events table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

-- Also check if there are any constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'events';

-- Check for NOT NULL constraints specifically
SELECT 
    column_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'events' 
AND is_nullable = 'NO'
ORDER BY ordinal_position;
