import { applyTheme } from './libs/theme.ts';
import { getPageFileName } from './libs/util.ts';

applyTheme();

try {
    const core = (await import(`./core/${getPageFileName()}.ts`)) as { default: () => void } | null;
    if (core) core.default();
} catch (_) {
    // Do nothing :3
}
