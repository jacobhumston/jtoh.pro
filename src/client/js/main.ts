/**
 * Main entry point for the client web pages.
 * This script will be executed on every page.
 *
 * Authored by Jacob Humston
 */
import { initAnalytics } from '@client/modules/analytics';
import { updateCurrentNavigation } from '@client/modules/navigation';
import { listenForThemeSwitches } from '@client/modules/theme';
import { disableConsoleLogIfNotLocalhost } from '@client/utils/logger';
import { checkForUpdates } from '@client/utils/update';

disableConsoleLogIfNotLocalhost();
updateCurrentNavigation();
listenForThemeSwitches();
checkForUpdates();
initAnalytics();
