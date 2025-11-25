/**
 * Generate API documentation.
 *
 * Authored by Jacob Humston
 */
import '../../../../node_modules/@scalar/api-reference/dist/browser/standalone.js';

// @ts-ignore
Scalar.createApiReference('#docs', {
    url: '/api/spec',
    showDeveloperTools: 'never',
    hideClientButton: true,
    withDefaultFonts: false,
    hideDarkModeToggle: true
});
