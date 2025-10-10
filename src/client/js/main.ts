/**
 * Main entry point for the client web pages.
 * This script will be executed on every page.
 *
 * Authored by Jacob Humston
 */
import { highlightCodeBlocksOnLoad } from './utils/code-blocks';
import { disableConsoleLogIfNotLocalhost } from './utils/logger';

// run some utility functions
disableConsoleLogIfNotLocalhost();
highlightCodeBlocksOnLoad();
