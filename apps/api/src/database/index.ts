import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

let db: Database | null = null;

export async function initializeDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  // Ensure database directory exists
  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = process.env.DATABASE_URL || path.join(dbDir, 'astroaudio.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');

  // Read and execute schema - use absolute paths
  const possiblePaths = [
    path.join(__dirname, 'schema.sql'), // dist/database/schema.sql
    path.join(process.cwd(), 'src', 'database', 'schema.sql'), // src/database/schema.sql
    path.join(process.cwd(), 'apps', 'api', 'src', 'database', 'schema.sql'), // full path
    path.join(process.cwd(), 'apps', 'api', 'dist', 'database', 'schema.sql') // copied path
  ];
  
  let schemaPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      schemaPath = p;
      break;
    }
  }
  
  console.log('🔍 Looking for schema.sql at:', possiblePaths);
  console.log('📁 Current directory:', process.cwd());
  console.log('📁 __dirname:', __dirname);
  
  if (!schemaPath) {
    console.error('❌ Schema file not found at any location');
    throw new Error(`Schema file not found. Tried: ${possiblePaths.join(', ')}`);
  }
  
  console.log('✅ Found schema at:', schemaPath);
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Execute the entire schema as one statement to avoid parsing issues
  try {
    await db.exec(schema);
    console.log('✅ Database schema executed successfully');
  } catch (error) {
    console.error('❌ Database schema execution failed:', error);
    throw error;
  }

  console.log('✅ Database initialized successfully');
  return db;
}

export async function getDatabase(): Promise<Database> {
  if (!db) {
    return await initializeDatabase();
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
} 
