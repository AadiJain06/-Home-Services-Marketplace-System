import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'bookings.db');

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Promisify database methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Initialize schema
export async function initializeDatabase() {
  // Bookings table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      service_type TEXT NOT NULL,
      description TEXT,
      address TEXT NOT NULL,
      scheduled_time TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      provider_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      cancelled_by TEXT,
      cancellation_reason TEXT
    )
  `);

  // Providers table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      service_types TEXT NOT NULL,
      is_available BOOLEAN DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Events/Logs table for observability
  await dbRun(`
    CREATE TABLE IF NOT EXISTS booking_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_data TEXT,
      performed_by TEXT,
      performed_by_type TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    )
  `);

  // Insert sample providers with Indian names (update existing if needed)
  const existingProviders = await dbAll('SELECT COUNT(*) as count FROM providers');
  if (existingProviders[0].count === 0) {
    await dbRun(`
      INSERT INTO providers (id, name, email, phone, service_types, is_available)
      VALUES 
        ('provider-1', 'Rajesh Kumar', 'rajesh.kumar@example.com', '+91-98765-43210', 'plumbing,electrical', 1),
        ('provider-2', 'Priya Sharma', 'priya.sharma@example.com', '+91-98765-43211', 'cleaning,plumbing', 1),
        ('provider-3', 'Amit Patel', 'amit.patel@example.com', '+91-98765-43212', 'electrical,handyman', 1)
    `);
  } else {
    // Update existing providers with Indian names
    await dbRun(`UPDATE providers SET name = 'Rajesh Kumar', email = 'rajesh.kumar@example.com', phone = '+91-98765-43210' WHERE id = 'provider-1'`);
    await dbRun(`UPDATE providers SET name = 'Priya Sharma', email = 'priya.sharma@example.com', phone = '+91-98765-43211' WHERE id = 'provider-2'`);
    await dbRun(`UPDATE providers SET name = 'Amit Patel', email = 'amit.patel@example.com', phone = '+91-98765-43212' WHERE id = 'provider-3'`);
  }
}

export { db, dbRun, dbGet, dbAll };
