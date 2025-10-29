---
title: "PostgreSQL Cheat Sheet for Front-End Developers"
description: "A practical guide to PostgreSQL for developers who know React better than databases"
pubDate: 2025-10-27
tags: ["postgres", "sql", "database", "tutorial"]
---

> A practical guide to PostgreSQL for developers who know React better than databases

## Table of Contents
- [Data Types](#data-types)
- [CREATE TABLE](#create-table)
- [Primary Keys](#primary-keys)
- [Foreign Keys](#foreign-keys)
- [Constraints](#constraints)
- [CRUD Operations](#crud-operations)
- [Indexes](#indexes)
- [ALTER TABLE](#alter-table)
- [DROP TABLE](#drop-table)
- [UUID Functions](#uuid-functions)

---

## Data Types

Think of these like TypeScript types:

```sql
-- Strings
VARCHAR(50)      -- string with max length
TEXT             -- string (unlimited)

-- Numbers
INTEGER          -- number (whole numbers: -2147483648 to 2147483647)
BIGINT           -- number (bigger whole numbers)
DECIMAL(10,2)    -- number (10 digits total, 2 after decimal)
REAL             -- number (floating point)
SERIAL           -- number (auto-incrementing integer)

-- Booleans
BOOLEAN          -- boolean (true/false)

-- Dates
TIMESTAMP        -- Date (with time)
DATE             -- Date (no time)
TIME             -- Time (no date)

-- JSON
JSON             -- any (stores JSON as text)
JSONB            -- any (stores JSON binary, faster queries)

-- UUIDs
UUID             -- string (validated UUID format)

-- Arrays
INTEGER[]        -- number[] (array of integers)
TEXT[]           -- string[] (array of text)
```

---

## CREATE TABLE

### Basic Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Table with Foreign Key
```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Junction Table (Many-to-Many)
```sql
CREATE TABLE user_roles (
    user_id UUID,
    role_id UUID,
    assigned_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

---

## Primary Keys

### Single Primary Key (Most Common)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50)
);
```

### Composite Primary Key (Multiple Columns)
```sql
CREATE TABLE user_roles (
    user_id UUID,
    role_id UUID,
    PRIMARY KEY (user_id, role_id)  -- BOTH together must be unique
);
```

**Important:** 
- ❌ You CANNOT have multiple primary keys per table
- ✅ You CAN have a primary key made of multiple columns (composite key)

---

## Foreign Keys

### One-to-Many Relationship
```sql
-- One user has many posts
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50)
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Many-to-Many Relationship
```sql
-- Users have many roles, roles have many users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50)
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50)
);

-- Junction table
CREATE TABLE user_roles (
    user_id UUID,
    role_id UUID,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

### Foreign Key with Cascade
```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT,
    -- Delete posts when user is deleted
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Constraints

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- NOT NULL: Must have a value
    username VARCHAR(50) NOT NULL,
    
    -- UNIQUE: No duplicates allowed
    email VARCHAR(100) UNIQUE NOT NULL,
    
    -- CHECK: Custom validation
    age INTEGER CHECK (age >= 18),
    price DECIMAL(10,2) CHECK (price > 0),
    
    -- DEFAULT: Auto-fill if not provided
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'pending'
);
```

---

## CRUD Operations

### CREATE (INSERT)

```sql
-- Single insert
INSERT INTO users (username, email) 
VALUES ('ryan', 'ryan@example.com');

-- Multiple inserts
INSERT INTO users (username, email) 
VALUES 
    ('alice', 'alice@example.com'),
    ('bob', 'bob@example.com'),
    ('charlie', 'charlie@example.com');

-- Insert and return the created row
INSERT INTO users (username, email) 
VALUES ('dave', 'dave@example.com')
RETURNING *;

-- Insert and return specific columns
INSERT INTO users (username, email) 
VALUES ('eve', 'eve@example.com')
RETURNING id, username;
```

### READ (SELECT)

```sql
-- Get all rows
SELECT * FROM users;

-- Get specific columns
SELECT username, email FROM users;

-- Filter with WHERE
SELECT * FROM users WHERE username = 'ryan';
SELECT * FROM users WHERE age >= 18;
SELECT * FROM users WHERE is_active = true;

-- Multiple conditions (AND)
SELECT * FROM users 
WHERE age >= 18 AND is_active = true;

-- Multiple conditions (OR)
SELECT * FROM users 
WHERE username = 'ryan' OR username = 'alice';

-- IN clause (like array.includes())
SELECT * FROM users 
WHERE username IN ('ryan', 'alice', 'bob');

-- Pattern matching (LIKE)
SELECT * FROM users WHERE email LIKE '%@gmail.com';
SELECT * FROM users WHERE username LIKE 'r%';  -- Starts with 'r'
SELECT * FROM users WHERE username LIKE '%an%'; -- Contains 'an'

-- NOT
SELECT * FROM users WHERE NOT is_active;
SELECT * FROM users WHERE email NOT LIKE '%@gmail.com';

-- NULL checks
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;

-- Order by
SELECT * FROM users ORDER BY created_at DESC;
SELECT * FROM users ORDER BY username ASC;
SELECT * FROM users ORDER BY age DESC, username ASC;

-- Limit and offset (pagination)
SELECT * FROM users LIMIT 10;
SELECT * FROM users LIMIT 10 OFFSET 20;  -- Skip 20, get next 10

-- Count
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM users WHERE is_active = true;

-- Distinct
SELECT DISTINCT email FROM users;
```

### UPDATE

```sql
-- Update one field
UPDATE users 
SET email = 'newemail@example.com' 
WHERE username = 'ryan';

-- Update multiple fields
UPDATE users 
SET email = 'new@example.com', is_active = false 
WHERE id = 'some-uuid-here';

-- Update with calculation
UPDATE users 
SET age = age + 1 
WHERE username = 'ryan';

-- Update all rows (BE CAREFUL!)
UPDATE users SET is_active = true;

-- Update and return modified rows
UPDATE users 
SET email = 'new@example.com' 
WHERE username = 'ryan'
RETURNING *;
```

### DELETE

```sql
-- Delete specific row
DELETE FROM users WHERE username = 'ryan';

-- Delete with condition
DELETE FROM users WHERE created_at < '2020-01-01';
DELETE FROM users WHERE is_active = false;

-- Delete all rows (BE VERY CAREFUL!)
DELETE FROM users;

-- Delete and return what was deleted
DELETE FROM users 
WHERE username = 'ryan'
RETURNING *;
```

---

## Indexes

Indexes make queries faster (like database performance optimization):

```sql
-- Create index on frequently queried column
CREATE INDEX idx_users_email ON users(email);

-- Unique index (enforces uniqueness like UNIQUE constraint)
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- Composite index (multiple columns)
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at);

-- Drop index
DROP INDEX idx_users_email;

-- Check if index exists
DROP INDEX IF EXISTS idx_users_email;
```

**When to use indexes:**
- ✅ Columns used in WHERE clauses frequently
- ✅ Foreign key columns
- ✅ Columns used in ORDER BY
- ✅ Columns used in JOIN conditions
- ❌ Small tables (overhead not worth it)
- ❌ Columns that change frequently (slows down writes)

---

## ALTER TABLE

Modifying existing tables:

```sql
-- Add column
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN bio TEXT DEFAULT '';

-- Drop column
ALTER TABLE users DROP COLUMN phone;

-- Rename column
ALTER TABLE users RENAME COLUMN username TO user_name;

-- Rename table
ALTER TABLE users RENAME TO app_users;

-- Change column type
ALTER TABLE users ALTER COLUMN age TYPE BIGINT;

-- Set default value
ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true;

-- Remove default value
ALTER TABLE users ALTER COLUMN is_active DROP DEFAULT;

-- Add NOT NULL constraint
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Remove NOT NULL constraint
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add constraint
ALTER TABLE users ADD CONSTRAINT check_age CHECK (age >= 18);
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);

-- Drop constraint
ALTER TABLE users DROP CONSTRAINT check_age;
```

---

## DROP TABLE

Deleting tables:

```sql
-- Delete table and all data
DROP TABLE users;

-- Delete if exists (no error if doesn't exist)
DROP TABLE IF EXISTS users;

-- Delete with cascade (also delete dependent tables/constraints)
DROP TABLE users CASCADE;
```

---

## UUID Functions

### Modern Way (PostgreSQL 13+)

```sql
-- Generate random UUID (v4)
SELECT gen_random_uuid();
-- Output: 550e8400-e29b-41d4-a716-446655440000

-- Use in table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50)
);
```

### Legacy Way (Requires Extension)

```sql
-- Enable extension (only needed once per database)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Generate UUIDs
SELECT uuid_generate_v1();  -- Time-based (contains MAC address)
SELECT uuid_generate_v4();  -- Random (same as gen_random_uuid)
```

### UUID Versions Explained

**v1 (Time-based):**
- Contains timestamp + MAC address
- ✅ Sortable by time
- ❌ Privacy leak (MAC address visible)

**v4 (Random):**
- Pure random
- ✅ Secure and unpredictable
- ✅ No privacy leaks
- ❌ Not sortable

**Recommendation:** Use `gen_random_uuid()` (v4) for modern apps!

---

## Frontend Dev Mental Model

Think of databases like normalized Redux state:

```javascript
// Frontend (Redux)
const state = {
  users: {
    byId: {
      '123': { id: '123', username: 'ryan', email: 'ryan@example.com' }
    },
    allIds: ['123']
  },
  posts: {
    byId: {
      '456': { id: '456', userId: '123', title: 'Hello World' }
    },
    allIds: ['456']
  }
};

// Backend (PostgreSQL)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100)
);

CREATE TABLE posts (
    id UUID PRIMARY KEY,
    user_id UUID,
    title TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Tables = State slices**  
**Foreign keys = References between slices**  
**Indexes = Performance optimization**

---

## Quick Reference

### Connection Info
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `postgres`
- **Username:** Your macOS username
- **Password:** (leave blank for local development)

### Common Commands
```bash
# Start PostgreSQL
brew services start postgresql@16

# Stop PostgreSQL
brew services stop postgresql@16

# Connect to database
psql -d postgres

# Check version
psql --version

# Run SQL from command line
psql -d postgres -c "SELECT * FROM users;"
```

### psql Commands (Inside psql shell)
```sql
\l              -- List all databases
\c dbname       -- Connect to database
\dt             -- List all tables
\d tablename    -- Describe table structure
\du             -- List all users
\q              -- Quit psql
```

---

## Best Practices

1. **Always use UUIDs for primary keys** (unless you have a good reason not to)
2. **Add indexes on foreign keys** (makes joins faster)
3. **Use NOT NULL for required fields** (catch errors early)
4. **Use UNIQUE for fields that should be unique** (like email, username)
5. **Use CHECK constraints for validation** (enforce business rules at DB level)
6. **Use TIMESTAMP for dates** (always include timezone info)
7. **Use JSONB over JSON** (faster queries, better indexing)
8. **Use CASCADE carefully** (can accidentally delete lots of data)
9. **Test queries before running in production** (especially DELETE and UPDATE)
10. **Back up your data regularly** (because shit happens)

*Made with ❤️ for frontend devs learning backend stuffs*