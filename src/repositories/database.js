const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

// Initialize SQLite database
const db = new Database(path.join(__dirname, '../../claims.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT NOT NULL CHECK(role IN ('customer', 'admin')),
    first_name TEXT,
    last_name TEXT,
    is_active INTEGER DEFAULT 0,
    invite_token TEXT UNIQUE,
    invite_expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    policy_id TEXT NOT NULL,
    date_of_occurrence DATE NOT NULL,
    location TEXT NOT NULL,
    cause TEXT NOT NULL CHECK(cause IN ('Accident', 'Theft', 'Damage', 'Delay-Interruption', 'Other')),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted', 'inReview', 'approved', 'rejected', 'cancelled')),
    assigned_agent_id INTEGER,
    status_note TEXT,
    documents TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_agent_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS claim_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id INTEGER NOT NULL,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by_user_id INTEGER NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES claims(id),
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
  CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
  CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at);
  CREATE INDEX IF NOT EXISTS idx_claims_assigned_agent ON claims(assigned_agent_id);
  CREATE INDEX IF NOT EXISTS idx_claim_history_claim_id ON claim_status_history(claim_id);
  CREATE INDEX IF NOT EXISTS idx_users_invite_token ON users(invite_token);
`);

// Seed default admin user
const checkAdmin = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin');

if (checkAdmin.count === 0) {
  const adminPassword = bcrypt.hashSync('admin123', 10);

  db.prepare(`
    INSERT INTO users (email, password_hash, role, first_name, last_name, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('admin@example.com', adminPassword, 'admin', 'Admin', 'User', 1);

  console.log('\n✓ Default admin user created');
  console.log('  Email: admin@example.com');
  console.log('  Password: admin123\n');
}

module.exports = db;
