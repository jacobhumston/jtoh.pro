/**
 * Main entry point for the client web pages.
 * This script will be executed on every page.
 *
 * Authored by Jacob Humston
 */
import { initAnalytics } from '@client/modules/analytics';
import { updateCurrentNavigation } from '@client/modules/navigation';
import { disableConsoleLogIfNotLocalhost } from '@client/utils/logger';
import { checkForUpdates } from '@client/utils/update';

// run some utility functions
disableConsoleLogIfNotLocalhost();
updateCurrentNavigation();
checkForUpdates();
initAnalytics();
