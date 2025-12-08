/**
 * Config for vitepress docs.
 *
 * Authored by Jacob Humston
 */
import { defineConfigWithTheme } from 'vitepress';
import baseConfig, { ThemeConfig } from 'vitepress-carbon/config';

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<ThemeConfig>({
    title: 'jtoh.pro Documentation',
    extends: baseConfig,
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guides', link: '/guides/' },
            { text: 'Legal', link: '/legal/' }
        ],
        sidebar: [
            {
                text: 'Guides',
                items: [{ text: 'Index', link: '/guides/' }]
            },
            {
                text: 'Legal',
                items: [
                    { text: 'Index', link: '/legal/' },
                    { text: 'TERMS OF SERVICE', link: '/legal/terms' },
                    { text: 'PRIVACY POLICY', link: '/legal/privacy' },
                    { text: 'COPYRIGHT NOTICE & DMC POLICY', link: '/legal/copyright' },
                    { text: 'COOKIE POLICY', link: '/legal/cookies' },
                    { text: 'REFUND AND CANCELLATION POLICY', link: '/legal/refunds' }
                ]
            }
        ],
        search: {
            provider: 'local'
        },
        socialLinks: [{ icon: 'discord', link: 'https://discord.jtoh.pro' }],
        logo: '/../favicon.ico',
        externalLinkIcon: true
    },
    base: '/docs/',
    cleanUrls: true
});
