-- DigiWebDex Database Initialization
-- Combine all SQL files in correct order

-- Run enums first
\i /docker-entrypoint-initdb.d/enums.sql

-- Then schema
\i /docker-entrypoint-initdb.d/schema.sql

-- Then functions
\i /docker-entrypoint-initdb.d/functions.sql

-- Finally triggers
\i /docker-entrypoint-initdb.d/triggers.sql
