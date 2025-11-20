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
    /** Authentication database. */
    auth: getDatabase('auth'),
    /** Cache database. */
    cache: getDatabase('cache'),
    /** Database used for user configuration. */
    config: getDatabase('config'),
    /** Database for leaderboards. */
    leaderboards: getDatabase('leaderboards'),
    /** Database for captchas. */
    captchas: getDatabase('captchas'),
    /** Database for server secrets. */
    secrets: getDatabase('secrets')
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
        const result = await this
            .#database`SELECT value FROM ${this.#database(this.#namespace)} WHERE key = ${this.#database(key)}`;
        if (result.length === 0) return null;

        return JSON.parse(result[0].value);
    }

    /**
     * Get multiple values by keys.
     * @param keys The keys to retrieve.
     * @returns An object with key-value pairs, will missing values being null.
     */
    async getMultiple<T = Q>(keys: string[]): Promise<Record<string, T | null>> {
        if (keys.length === 0) return {};

        const result = await this
            .#database`SELECT key, value FROM ${this.#database(this.#namespace)} WHERE key IN ${this.#database(keys)}`;
        const output: Record<string, T | null> = {};

        for (const key of keys) {
            output[key] = null;
        }

        for (const row of result) {
            output[row.key] = JSON.parse(row.value);
        }

        return output;
    }

    /**
     * Set a value by key.
     * @param key The key to set.
     * @param value The value to store.
     */
    async set<T = Q>(key: string, value: T): Promise<void> {
        const serializedValue = JSON.stringify(value);
        await this
            .#database`INSERT OR REPLACE INTO ${this.#database(this.#namespace)} (key, value) VALUES (${this.#database(key)}, ${serializedValue})`;
    }

    /**
     * Delete a key.
     * @param key The key to delete.
     * @returns Whether the key was deleted.
     */
    async delete(key: string): Promise<boolean> {
        const result = await this
            .#database`DELETE FROM ${this.#database(this.#namespace)} WHERE key = ${this.#database(key)}`;
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
            .#database`SELECT 1 FROM ${this.#database(this.#namespace)} WHERE key = ${this.#database(key)} LIMIT 1`;
        return result.length > 0;
    }
}

/**
 * Create an ordered table in a database if it doesn't already exist.
 * @param db The database to create the table in.
 * @param name The name of the table.
 */
async function createOrderedTable(db: SQL, name: string) {
    await db`CREATE TABLE IF NOT EXISTS ${db(name)} ( key TEXT PRIMARY KEY, value REAL NOT NULL, tiebreaker REAL DEFAULT 0 )`;
    // Create composite index for efficient ordering with tiebreaker
    await db`CREATE INDEX IF NOT EXISTS ${db(`idx_${name}_value_tiebreaker`)} ON ${db(name)} (value DESC, tiebreaker DESC)`;
}

/** Class to interact with an ordered database where values are numbers. */
export class OrderedDatabaseClient {
    /** This database client's database. */
    #database: SQL;
    /** The namespace (table name) for this client. */
    #namespace: string;

    /**
     * Create a new ordered database client.
     * @param database The name of the database this client should use.
     * @param namespace The namespace of this database client.
     */
    constructor(database: DatabaseName, namespace: string) {
        this.#database = databases[database];
        this.#namespace = namespace;
        createOrderedTable(this.#database, namespace);
    }

    /**
     * Get a value and tiebreaker by key.
     * @param key The key to retrieve.
     * @returns Object with value and tiebreaker, or null if not found.
     */
    async get(key: string): Promise<{ value: number; tiebreaker: number } | null> {
        const result = await this
            .#database`SELECT value, tiebreaker FROM ${this.#database(this.#namespace)} WHERE key = ${this.#database(key)}`;
        if (result.length === 0) return null;
        return { value: result[0].value, tiebreaker: result[0].tiebreaker || 0 };
    }

    /**
     * Get multiple values and tiebreakers by keys.
     * @param keys The keys to retrieve.
     * @returns An object with key-value pairs, with missing values being null.
     */
    async getMultiple(keys: string[]): Promise<Record<string, { value: number; tiebreaker: number } | null>> {
        if (keys.length === 0) return {};

        const result = await this
            .#database`SELECT key, value, tiebreaker FROM ${this.#database(this.#namespace)} WHERE key IN ${this.#database(keys)}`;
        const output: Record<string, { value: number; tiebreaker: number } | null> = {};

        for (const key of keys) {
            output[key] = null;
        }

        for (const row of result) {
            output[row.key] = { value: row.value, tiebreaker: row.tiebreaker || 0 };
        }

        return output;
    }

    /**
     * Set a value by key with optional tiebreaker.
     * @param key The key to set.
     * @param value The numeric value to store.
     * @param tiebreaker Optional tiebreaker value (defaults to 0).
     */
    async set(key: string, value: number, tiebreaker: number = 0): Promise<void> {
        await this
            .#database`INSERT OR REPLACE INTO ${this.#database(this.#namespace)} (key, value, tiebreaker) VALUES (${this.#database(key)}, ${value}, ${tiebreaker})`;
    }

    /**
     * Delete a key.
     * @param key The key to delete.
     * @returns Whether the key was deleted.
     */
    async delete(key: string): Promise<boolean> {
        const result = await this
            .#database`DELETE FROM ${this.#database(this.#namespace)} WHERE key = ${this.#database(key)}`;
        return result.changes > 0;
    }

    /**
     * Get all key-value-tiebreaker entries.
     * @returns An object with all key-value-tiebreaker entries.
     */
    async all(): Promise<Record<string, { value: number; tiebreaker: number }>> {
        const rows = await this.#database`SELECT key, value, tiebreaker FROM ${this.#database(this.#namespace)}`;
        const result: Record<string, { value: number; tiebreaker: number }> = {};

        for (const row of rows) {
            result[row.key] = { value: row.value, tiebreaker: row.tiebreaker || 0 };
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
            .#database`SELECT 1 FROM ${this.#database(this.#namespace)} WHERE key = ${this.#database(key)} LIMIT 1`;
        return result.length > 0;
    }

    /**
     * Get ordered entries within a range, always including ties.
     * @param start The starting position (1-based, inclusive).
     * @param end The ending position (1-based, inclusive).
     * @param descending Whether to sort in descending order (true) or ascending (false).
     * @returns Array of key-value-tiebreaker entries in the specified range and order, including all ties.
     */
    async getOrdered(
        start: number,
        end: number,
        descending: boolean = true
    ): Promise<Array<{ key: string; value: number; tiebreaker: number }>> {
        if (start < 1 || end < start) {
            throw new Error('Invalid range: start must be >= 1 and end must be >= start');
        }

        // Always include all ties within and at the boundaries of the range
        // First get all data with rankings
        let allData;
        if (descending) {
            allData = await this.#database`
                SELECT key, value, tiebreaker,
                       DENSE_RANK() OVER (ORDER BY value DESC, tiebreaker DESC) as dense_rank,
                       ROW_NUMBER() OVER (ORDER BY value DESC, tiebreaker DESC, key ASC) as row_num
                FROM ${this.#database(this.#namespace)}
                ORDER BY value DESC, tiebreaker DESC, key ASC
            `;
        } else {
            allData = await this.#database`
                SELECT key, value, tiebreaker,
                       DENSE_RANK() OVER (ORDER BY value ASC, tiebreaker ASC) as dense_rank,
                       ROW_NUMBER() OVER (ORDER BY value ASC, tiebreaker ASC, key ASC) as row_num
                FROM ${this.#database(this.#namespace)}
                ORDER BY value ASC, tiebreaker ASC, key ASC
            `;
        }

        // Find the dense ranks that correspond to our start and end positions
        let startRank = null;
        let endRank = null;

        for (const row of allData) {
            if (row.row_num === start && startRank === null) {
                startRank = row.dense_rank;
            }
            if (row.row_num === end && endRank === null) {
                endRank = row.dense_rank;
            }
        }

        // If we don't have enough entries, just return what we have in range
        if (startRank === null) {
            return allData
                .filter((row: any) => row.row_num >= start)
                .map((row: any) => ({ key: row.key, value: row.value, tiebreaker: row.tiebreaker || 0 }));
        }

        if (endRank === null) {
            return allData
                .filter((row: any) => row.dense_rank >= startRank)
                .map((row: any) => ({ key: row.key, value: row.value, tiebreaker: row.tiebreaker || 0 }));
        }

        // Return all entries whose dense rank falls within our range
        // This includes all ties at both boundaries
        return allData
            .filter((row: any) => row.dense_rank >= startRank && row.dense_rank <= endRank)
            .map((row: any) => ({ key: row.key, value: row.value, tiebreaker: row.tiebreaker || 0 }));
    }

    /**
     * Get the top N entries, including all ties.
     * @param n The number of entries to retrieve.
     * @param descending Whether to sort in descending order (true) or ascending (false).
     * @returns Array of the top N key-value-tiebreaker entries, including all ties.
     */
    async getTop(
        n: number,
        descending: boolean = true
    ): Promise<Array<{ key: string; value: number; tiebreaker: number }>> {
        return this.getOrdered(1, n, descending);
    }

    /**
     * Get the rank of a specific key, accounting for ties and tiebreakers.
     * @param key The key to find the rank for.
     * @param descending Whether to rank in descending order (true) or ascending (false).
     * @returns The rank (1-based) of the key, or null if not found. Entries are ranked by value, then tiebreaker.
     */
    async getRank(key: string, descending: boolean = true): Promise<number | null> {
        let result;
        if (descending) {
            result = await this.#database`
                SELECT rank FROM (
                    SELECT key, 
                           DENSE_RANK() OVER (ORDER BY value DESC, tiebreaker DESC) as rank
                    FROM ${this.#database(this.#namespace)}
                ) ranked
                WHERE key = ${this.#database(key)}
            `;
        } else {
            result = await this.#database`
                SELECT rank FROM (
                    SELECT key, 
                           DENSE_RANK() OVER (ORDER BY value ASC, tiebreaker ASC) as rank
                    FROM ${this.#database(this.#namespace)}
                ) ranked
                WHERE key = ${this.#database(key)}
            `;
        }

        return result.length > 0 ? result[0].rank : null;
    }

    /**
     * Get the total count of entries.
     * @returns The total number of entries in the table.
     */
    async count(): Promise<number> {
        const result = await this.#database`SELECT COUNT(*) as count FROM ${this.#database(this.#namespace)}`;
        return result[0].count;
    }
}
