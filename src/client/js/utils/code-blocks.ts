/**
 * This is a simple file that handles code blocks.
 *
 * Authored by Jacob Humston
 */
import highlightjs from 'highlight.js';

/**
 * Utility function to highlight code blocks.
 */
export function highlightCodeBlocks() {
    highlightjs.highlightAll();
}

/**
 * Load code blocks on dom content loaded.
 */
export function highlightCodeBlocksOnLoad() {
    document.addEventListener('DOMContentLoaded', highlightCodeBlocks);
}
