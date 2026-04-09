/**
 * Generate API documentation.
 *
 * Authored by Jacob Humston
 */
import '@node_modules/@scalar/api-reference/dist/browser/standalone.js';
import type {} from '@node_modules/@scalar/api-reference/dist/standalone/lib/register-globals.d.ts';

window.Scalar.createApiReference('#docs', {
    url: '/api/spec',
    showDeveloperTools: 'never',
    hideClientButton: true,
    withDefaultFonts: false,
    hideDarkModeToggle: true,
    defaultOpenAllTags: true,
    documentDownloadType: 'direct',
    telemetry: false,
    agent: { disabled: true },
    defaultHttpClient: { targetKey: 'js', clientKey: 'fetch' },
    mcp: { disabled: true }
});
