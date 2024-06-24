/**
 * File used for json database management.
 */

// Import modules.
import { JsonDB, Config } from 'node-json-db';

/** Table of databases saved in memory. */
const databaseTable = {};

/**
 * Database class, which is just a shell wrapper.
 */
export class Database {
    /**
     * Internal database.
     * @type {JsonDB}
     */
    #database;

    /** Create a new database. */
    constructor(database) {
        this.#database = database;
        this.#database.load();
    }

    /**
     * Get a key's data from the database.
     * @param {string} key Key to get the data of.
     * @param {any} fallback This value is returned if key doesn't exist.
     * @returns {Promise<any>} The key's data or `fallback` if key doesn't exist.
     */
    async get(key, fallback) {
        if (!key.startsWith('/')) throw 'Key must start with a slash! (/)';
        if (!(await this.#database.exists(key))) return fallback;
        return await this.#database.getData(key);
    }

    /**
     * Set a key's data in the database.
     * @param {string} key The key to set the data of.
     * @param {any} data The new data for the key.
     */
    async set(key, data) {
        if (!key.startsWith('/')) throw 'Key must start with a slash! (/)';
        return await this.#database.push(key, data);
    }

    /**
     * Delete a key from the database.
     * @param {string} key The key to delete.
     */
    async delete(key) {
        if (!key.startsWith('/')) throw 'Key must start with a slash! (/)';
        await this.#database.reload();
        if (!(await this.#database.exists(key))) return;
        return await this.#database.delete(key);
    }
}

/**
 * Get a database by name.
 * @param {string} name The name of the database to get.
 * @returns {Database} The database.
 */
export function getJSONDatabase(name) {
    const fullName = `database/json/${name}`;
    const database = databaseTable[name] ?? new Database(new JsonDB(new Config(fullName, true, false, '/')));
    if (!databaseTable[name]) databaseTable[name] = database;
    return database;
}
