# Database Design Fundamentals

Good database design is the foundation of efficient, scalable applications. Whether you're working with SQL or NoSQL databases, understanding design principles will help you build systems that perform well and are easy to maintain.

## Database Design Principles

### Normalization

Normalization reduces data redundancy and improves data integrity:

**First Normal Form (1NF):**
- Each column contains atomic values
- No repeating groups of data

```sql
-- ❌ Violates 1NF
CREATE TABLE bad_orders (
  id INT PRIMARY KEY,
  customer_name VARCHAR(100),
  items VARCHAR(500)  -- "item1,item2,item3"
);

-- ✅ Follows 1NF
CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_name VARCHAR(100)
);

CREATE TABLE order_items (
  order_id INT,
  item_name VARCHAR(100),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

**Second Normal Form (2NF):**
- Must be in 1NF
- No partial dependencies on composite primary keys

**Third Normal Form (3NF):**
- Must be in 2NF
- No transitive dependencies

### Denormalization Trade-offs

Sometimes breaking normalization rules improves performance:

**When to Denormalize:**
- Read-heavy applications
- Complex joins are expensive
- Analytical workloads
- Caching frequently accessed data

**Risks of Denormalization:**
- Data inconsistency
- Increased storage requirements
- More complex update operations

## SQL Database Design

### Table Design Best Practices

**Naming Conventions:**
```sql
-- Use descriptive, consistent names
users               -- table names: plural, lowercase
user_profiles       -- compound names: underscore_separated
created_at          -- timestamps: descriptive suffixes
is_active          -- booleans: is_ or has_ prefix
```

**Primary Keys:**
```sql
-- Auto-incrementing integer
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL
);

-- UUID for distributed systems
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT REFERENCES users(id)
);
```

**Data Types:**
```sql
-- Choose appropriate data types
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,           -- Variable length string
  price DECIMAL(10,2) NOT NULL,         -- Exact decimal for money
  created_at TIMESTAMP WITH TIME ZONE,  -- Include timezone
  is_featured BOOLEAN DEFAULT FALSE,    -- Boolean for flags
  metadata JSONB                        -- JSON for flexible data
);
```

### Indexing Strategy

**Single Column Indexes:**
```sql
-- Index frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

**Composite Indexes:**
```sql
-- Order matters: most selective column first
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- This index can serve these queries:
-- WHERE user_id = ? AND status = ?
-- WHERE user_id = ?
-- But NOT efficiently: WHERE status = ?
```

**Partial Indexes:**
```sql
-- Index only relevant rows
CREATE INDEX idx_active_users ON users(email) WHERE is_active = TRUE;
```

### Foreign Key Relationships

**One-to-Many:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Many-to-Many:**
```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id INT,
  tag_id INT,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

**Self-Referencing:**
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_id INT,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);
```

## NoSQL Database Design

### Document Database Design (MongoDB)

**Embedding vs. Referencing:**

```javascript
// Embedding: Good for data accessed together
{
  "_id": ObjectId("..."),
  "title": "Blog Post Title",
  "author": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "comments": [
    {
      "author": "Jane Smith",
      "text": "Great post!",
      "date": ISODate("...")
    }
  ]
}

// Referencing: Good for data used independently
{
  "_id": ObjectId("..."),
  "title": "Blog Post Title",
  "author_id": ObjectId("..."),
  "tag_ids": [ObjectId("..."), ObjectId("...")]
}
```

**Schema Design Patterns:**

**Subset Pattern:**
```javascript
// User collection (frequently accessed data)
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "name": "John Doe",
  "recent_orders": [
    { "id": ObjectId("..."), "total": 99.99, "date": "..." }
  ]
}

// Order collection (complete data)
{
  "_id": ObjectId("..."),
  "user_id": ObjectId("..."),
  "items": [...],
  "total": 99.99,
  "shipping_address": {...}
}
```

**Bucket Pattern:**
```javascript
// IoT sensor data bucketed by hour
{
  "_id": ObjectId("..."),
  "sensor_id": "temp_001",
  "date": ISODate("2023-01-01T10:00:00Z"),
  "readings": [
    { "minute": 0, "temperature": 22.5 },
    { "minute": 1, "temperature": 22.6 },
    // ... up to 60 readings
  ]
}
```

### Key-Value Store Design (Redis)

**Data Structure Selection:**

```redis
# Strings for simple values
SET user:1001:name "John Doe"
GET user:1001:name

# Hashes for objects
HSET user:1001 name "John Doe" email "john@example.com" age 30
HGETALL user:1001

# Lists for ordered data
LPUSH recent_searches:1001 "python tutorial"
LRANGE recent_searches:1001 0 9

# Sets for unique collections
SADD user:1001:tags "developer" "python" "javascript"
SMEMBERS user:1001:tags

# Sorted sets for rankings
ZADD leaderboard 1500 "player1" 1200 "player2"
ZREVRANGE leaderboard 0 9 WITHSCORES
```

**Naming Conventions:**
```redis
# Use consistent delimiter patterns
user:1001                    # entity:id
user:1001:profile           # entity:id:attribute
session:abc123              # entity:token
cache:user:1001:posts       # namespace:entity:id:data
queue:email:urgent          # queue:type:priority
```

## Performance Optimization

### Query Optimization

**Analyze Query Performance:**
```sql
-- PostgreSQL
EXPLAIN ANALYZE SELECT * FROM orders 
WHERE user_id = 1001 AND status = 'pending';

-- MySQL
EXPLAIN FORMAT=JSON SELECT * FROM orders 
WHERE user_id = 1001 AND status = 'pending';
```

**Common Anti-patterns:**
```sql
-- ❌ Avoid SELECT *
SELECT * FROM users WHERE email = 'user@example.com';

-- ✅ Select only needed columns
SELECT id, name, email FROM users WHERE email = 'user@example.com';

-- ❌ Avoid functions in WHERE clauses
SELECT * FROM orders WHERE YEAR(created_at) = 2023;

-- ✅ Use range queries instead
SELECT * FROM orders 
WHERE created_at >= '2023-01-01' AND created_at < '2024-01-01';
```

### Caching Strategies

**Application-Level Caching:**
```javascript
// Cache frequently accessed data
const getUserProfile = async (userId) => {
  const cacheKey = `user:${userId}:profile`;
  let profile = await redis.get(cacheKey);
  
  if (!profile) {
    profile = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    await redis.setex(cacheKey, 3600, JSON.stringify(profile)); // 1 hour TTL
  } else {
    profile = JSON.parse(profile);
  }
  
  return profile;
};
```

**Database Query Caching:**
```sql
-- PostgreSQL: Use materialized views for complex aggregations
CREATE MATERIALIZED VIEW user_stats AS
SELECT 
  user_id,
  COUNT(*) as total_orders,
  SUM(total) as total_spent,
  MAX(created_at) as last_order
FROM orders 
GROUP BY user_id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW user_stats;
```

### Partitioning

**Horizontal Partitioning (Sharding):**
```sql
-- Partition by date
CREATE TABLE orders_2023 (
  CHECK (created_at >= '2023-01-01' AND created_at < '2024-01-01')
) INHERITS (orders);

CREATE TABLE orders_2024 (
  CHECK (created_at >= '2024-01-01' AND created_at < '2025-01-01')
) INHERITS (orders);
```

**Vertical Partitioning:**
```sql
-- Split frequently accessed from rarely accessed columns
CREATE TABLE users_core (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  name VARCHAR(255),
  created_at TIMESTAMP
);

CREATE TABLE users_extended (
  user_id INT PRIMARY KEY,
  bio TEXT,
  preferences JSONB,
  last_login TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users_core(id)
);
```

## Data Modeling Patterns

### Event Sourcing

Store events rather than current state:

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  version INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Example events
INSERT INTO events (aggregate_id, event_type, event_data, version)
VALUES 
  ('user-123', 'UserCreated', '{"email": "user@example.com"}', 1),
  ('user-123', 'UserEmailChanged', '{"email": "new@example.com"}', 2),
  ('user-123', 'UserDeactivated', '{}', 3);
```

### CQRS (Command Query Responsibility Segregation)

Separate read and write models:

```sql
-- Write model (normalized)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  total DECIMAL(10,2) NOT NULL
);

-- Read model (denormalized for queries)
CREATE TABLE order_summaries (
  id SERIAL PRIMARY KEY,
  order_id INT UNIQUE NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  item_count INT NOT NULL
);
```

### Temporal Data

Track changes over time:

```sql
CREATE TABLE product_prices (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  valid_from TIMESTAMP NOT NULL,
  valid_to TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Query current price
SELECT price FROM product_prices 
WHERE product_id = 1 
  AND valid_from <= NOW() 
  AND (valid_to IS NULL OR valid_to > NOW());
```

## Security Considerations

### Access Control

**Row-Level Security (PostgreSQL):**
```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own orders
CREATE POLICY user_orders ON orders 
  FOR ALL TO app_user
  USING (user_id = current_setting('app.user_id')::INT);
```

**Column-Level Security:**
```sql
-- Grant specific column access
GRANT SELECT (id, name, email) ON users TO readonly_user;
GRANT SELECT, UPDATE (name, email) ON users TO standard_user;
```

### Data Encryption

**Encryption at Rest:**
```sql
-- PostgreSQL transparent encryption
CREATE TABLE sensitive_data (
  id SERIAL PRIMARY KEY,
  ssn VARCHAR(255) ENCRYPTED,
  credit_card VARCHAR(255) ENCRYPTED
);
```

**Application-Level Encryption:**
```javascript
const crypto = require('crypto');

const encrypt = (text, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};
```

## Testing Database Design

### Unit Testing

```javascript
// Test database operations
describe('User Repository', () => {
  beforeEach(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(async () => {
    await db.migrate.rollback();
  });

  it('should create user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User'
    };
    
    const user = await userRepository.create(userData);
    
    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
  });
});
```

### Performance Testing

```javascript
// Load testing database operations
const loadTest = async () => {
  const promises = [];
  
  for (let i = 0; i < 1000; i++) {
    promises.push(userRepository.findById(Math.floor(Math.random() * 10000)));
  }
  
  const start = Date.now();
  await Promise.all(promises);
  const end = Date.now();
  
  console.log(`1000 queries completed in ${end - start}ms`);
};
```

## Conclusion

Good database design requires understanding your data, access patterns, and performance requirements. Start with a solid normalized design, then optimize based on actual usage patterns.

Remember that database design is often about trade-offs:
- Normalization vs. query performance
- Consistency vs. availability
- Storage space vs. query speed
- Flexibility vs. performance

The best design is one that meets your application's specific requirements while remaining maintainable and scalable as your system grows.