/**
 * This script manages authentication.
 * It includes some built-in security features as well.
 *
 * Authored by Jacob Humston
 */

import { DatabaseClient } from "@server/managers/database";

// auth database
const database = new DatabaseClient('auth', 'users');

