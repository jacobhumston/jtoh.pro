/**
 * Simple draw page, using tldraw. (just for fun)
 * Also used as a test for the bundler, due to the complexity.
 *
 * Authored by Jacob Humston
 */
import r2wc from '@r2wc/react-to-web-component';
import { Tldraw } from '@tldraw/tldraw';

const TldrawWebComponent = r2wc(Tldraw, {
    props: {
        forceMobile: 'boolean',
        onMount: 'function',
        assetUrls: 'json'
    }
});
customElements.define('tl-draw', TldrawWebComponent);
