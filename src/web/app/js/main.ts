import { applyTheme } from './libs/theme.ts';
import { getPageFileName } from './libs/util.ts';

applyTheme();

const core = (await import(`./core/${getPageFileName()}.ts`).catch(() => null)) as { default: () => void } | null;
if (core) core.default();
