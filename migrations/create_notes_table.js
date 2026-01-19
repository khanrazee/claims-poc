const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'claims.db');
const db = new Database(dbPath);

console.log('Creating claim_notes table...');

try {
  // Create claim_notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS claim_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      claim_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      note TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (claim_id) REFERENCES claims(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Create index for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_claim_notes_claim_id ON claim_notes(claim_id);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_claim_notes_user_id ON claim_notes(user_id);
  `);

  console.log('✅ claim_notes table created successfully!');
  console.log('✅ Indexes created successfully!');

  // Migrate existing status_note data to notes table
  console.log('\nMigrating existing status_note data...');

  const claims = db.prepare('SELECT id, status_note, updated_by_id FROM claims WHERE status_note IS NOT NULL').all();

  if (claims.length > 0) {
    const insertNote = db.prepare(`
      INSERT INTO claim_notes (claim_id, user_id, note)
      VALUES (?, ?, ?)
    `);

    for (const claim of claims) {
      // Use updated_by_id if available, otherwise use claim owner (user_id)
      const noteUserId = claim.updated_by_id || 1; // Default to admin if no updated_by
      insertNote.run(claim.id, noteUserId, claim.status_note);
      console.log(`  Migrated note for claim ${claim.id}`);
    }

    console.log(`✅ Migrated ${claims.length} existing notes!`);
  } else {
    console.log('  No existing notes to migrate.');
  }

  console.log('\n✅ Migration completed successfully!');
  console.log('\nNext step: Drop status_note column from claims table (run drop_status_note_column.js)');

} catch (error) {
  console.error('❌ Error creating notes table:', error.message);
  process.exit(1);
}

db.close();
