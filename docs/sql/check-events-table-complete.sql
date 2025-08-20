-- Complete Events Table Structure Check
-- Run this in your Supabase SQL Editor to see exactly what we're working with

-- 1. Check all columns and their constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN is_nullable = 'NO' THEN 'REQUIRED'
        ELSE 'OPTIONAL'
    END as requirement
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

-- 2. Check for NOT NULL constraints specifically
SELECT 
    column_name,
    data_type,
    'REQUIRED - Cannot be NULL' as status
FROM information_schema.columns 
WHERE table_name = 'events' 
AND is_nullable = 'NO'
ORDER BY ordinal_position;

-- 3. Check for foreign key constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'events' 
AND tc.constraint_type = 'FOREIGN KEY';

-- 4. Check for check constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'events' 
AND tc.constraint_type = 'CHECK';

-- 5. Show current data (if any exists)
SELECT 
    'Current events count' as info,
    COUNT(*) as count
FROM events
UNION ALL
SELECT 
    'Events with NULL values' as info,
    COUNT(*) as count
FROM events 
WHERE name IS NULL 
   OR date IS NULL 
   OR start_time IS NULL 
   OR end_time IS NULL
   OR status IS NULL;
