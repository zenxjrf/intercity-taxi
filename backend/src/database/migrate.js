const { pool } = require('./connection');
const fs = require('fs');
const path = require('path');

async function migrate() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();
    
    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        
        await pool.query(sql);
        console.log(`Applied migration: ${file}`);
      }
    }
    
    console.log('All migrations applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
