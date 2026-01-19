const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'claims.db');
const db = new Database(dbPath);

console.log('Creating policies table...');

try {
  // Create policies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS policies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      created_by_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('active', 'draft', 'cancelled')),
      effective_at_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by_id) REFERENCES users(id)
    );
  `);

  console.log('✅ policies table created successfully!');

  // Create indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_policies_created_by ON policies(created_by_id);`);

  console.log('✅ Indexes created successfully!');

  // Add policy_id column to users table
  console.log('\nAdding policy_id to users table...');

  db.exec(`ALTER TABLE users ADD COLUMN policy_id INTEGER REFERENCES policies(id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_policy ON users(policy_id);`);

  console.log('✅ policy_id column added to users table!');

  // Create a default policy
  console.log('\nCreating default policy...');

  const insertPolicy = db.prepare(`
    INSERT INTO policies (name, description, created_by_id, status, effective_at_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertPolicy.run(
    'Standard Coverage Policy',
    'Basic insurance coverage for general claims. Includes property damage, theft, and liability coverage up to standard limits.',
    1, // Admin user
    'active',
    '2026-01-01'
  );

  console.log('✅ Default policy created!');

  console.log('\n✅ Migration completed successfully!');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

db.close();
