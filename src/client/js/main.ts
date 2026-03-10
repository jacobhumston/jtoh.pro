/**
 * Main entry point for the client web pages.
 * This script will be executed on every page.
 *
 * Authored by Jacob Humston
 */
import 'core-js/actual';

import { listen } from 'quicklink';

import { initAnalytics } from '@client/modules/analytics';
import { handleNavigation } from '@client/modules/navigation';
import { listenForThemeSwitches } from '@client/modules/theme';
import { disableConsoleLogIfNotLocalhost } from '@client/utils/logger';
import { checkForUpdates } from '@client/utils/update';

initAnalytics();
disableConsoleLogIfNotLocalhost();
handleNavigation();
listenForThemeSwitches();
checkForUpdates();
listen();
