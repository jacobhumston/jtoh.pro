/**
 * Captcha module, handling captchas.
 *
 * Authored by Jacob Humston
 */
import 'altcha';

export function addWidget() {
    const widgetHTML = '<altcha-widget challengeurl="/api/captcha" floating></altcha-widget>';
    return document.querySelector('altcha-widget');
}
