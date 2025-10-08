/**
 * This script manages databases and how they are accessed.
 * A good rule of thumb is that this should be the
 * only file that contains any query statements.
 *
 * Authored by Jacob Humston
 */
import { createPath } from './files';

import sqlite from 'bun:sqlite';

// it is important that this path exists before we do anything
createPath('db');

// an object of all of our databases
const databases = {
    auth: new sqlite('db/auth.sqlite', { readwrite: true, create: true })
};

// enable WAL on all our databases before any methods are available
for (const database of Object.values(databases)) {
    database.run('PRAGMA journal_mode = WAL;');
}

/**
 * Create a table in a database if it doesn't already exist.
 * @param db The database to create the table in.
 * @param name The name of the table.
 */
function createTable(db: sqlite, name: string) {
    db.run(`CREATE TABLE IF NOT EXISTS ${name} ( key TEXT PRIMARY KEY, value TEXT NOT NULL )`);
}

// create tables that we need
createTable(databases.auth, 'sessions');
