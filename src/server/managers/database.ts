/**
 * This script manages databases and how they are accessed.
 * A good rule of thumb is that this should be the
 * only file that contains any query statements.
 *
 * Authored by Jacob Humston
 */
import { SQL } from 'bun';

import { createPath } from './files';

// it is important that this path exists before we do anything
createPath('db');

/**
 * Get a database/sql instance.
 * @param name The name of the database to get.
 * @returns The SQL instance for this database.
 */
function getDatabase(name: string) {
    return new SQL(`db/${name}.sqlite`, { readwrite: true, create: true, strict: true, adapter: 'sqlite' });
}

// an object of all of our databases
const databases = {
    auth: getDatabase('auth'),
    cache: getDatabase('cache'),
    config: getDatabase('config'),
    leaderboards: getDatabase('leaderboards'),
    captchas: getDatabase('captchas')
};

/** Type the represents a valid database name. */
export type DatabaseName = keyof typeof databases;

// enable WAL on all our databases before any methods are available
for (const database of Object.values(databases)) {
    await database`PRAGMA journal_mode = WAL;`;
}

/**
 * Create a table in a database if it doesn't already exist.
 * @param db The database to create the table in.
 * @param name The name of the table.
 */
async function createTable(db: SQL, name: string) {
    await db`CREATE TABLE IF NOT EXISTS ${db(name)} ( key TEXT PRIMARY KEY, value TEXT NOT NULL )`;
}

/** Class to interact with a database. */
export class DatabaseClient<Q = any> {
    /** This database client's database. */
    #database: SQL;
    /** The namespace (table name) for this client. */
    #namespace: string;

    /**
     * Create a new database client.
     * @param database The name of the database this client should use.
     * @param namespace The namespace of this database client.
     */
    constructor(database: DatabaseName, namespace: string) {
        this.#database = databases[database];
        this.#namespace = namespace;
        createTable(this.#database, namespace);
    }

    /**
     * Get a value by key.
     * @param key The key to retrieve.
     * @returns The value or null if not found.
     */
    async get<T = Q>(key: string): Promise<T | null> {
        const result = await this.#database`SELECT value FROM ${this.#database(this.#namespace)} WHERE key = ${key}`;
        if (result.length === 0) return null;

        return JSON.parse(result[0].value);
    }

    /**
     * Set a value by key.
     * @param key The key to set.
     * @param value The value to store.
     */
    async set<T = Q>(key: string, value: T): Promise<void> {
        const serializedValue = JSON.stringify(value);
        await this
            .#database`INSERT OR REPLACE INTO ${this.#database(this.#namespace)} (key, value) VALUES (${key}, ${serializedValue})`;
    }

    /**
     * Delete a key.
     * @param key The key to delete.
     * @returns Whether the key was deleted.
     */
    async delete(key: string): Promise<boolean> {
        const result = await this.#database`DELETE FROM ${this.#database(this.#namespace)} WHERE key = ${key}`;
        return result.changes > 0;
    }

    /**
     * Get all key-value pairs.
     * @returns An object with all key-value pairs.
     */
    async all<T = Q>(): Promise<Record<string, T>> {
        const rows = await this.#database`SELECT key, value FROM ${this.#database(this.#namespace)}`;
        const result: Record<string, T> = {};

        for (const row of rows) {
            result[row.key] = JSON.parse(row.value);
        }

        return result;
    }

    /**
     * Check if a key exists.
     * @param key The key to check.
     * @returns Whether the key exists.
     */
    async exists(key: string): Promise<boolean> {
        const result = await this
            .#database`SELECT 1 FROM ${this.#database(this.#namespace)} WHERE key = ${key} LIMIT 1`;
        return result.length > 0;
    }
}
