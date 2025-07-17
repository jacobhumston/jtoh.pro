let logDisabled = false;
let logIndex = 0;
const logColors = {
    info: '#00bfff',
    warn: '#ffa500',
    error: '#ff4500',
    success: '#32cd32'
};

/**
 * Log something to the console.
 * @param type The type of log message.
 * @param message The message to log.
 */
export function log(type: 'info' | 'warn' | 'error' | 'success', message: string, extraStyles?: string[]): void {
    if (logDisabled) return;
    const extraStylesArray = [];
    if (extraStyles) extraStylesArray.push(...extraStyles);
    logIndex++;
    console.log(
        `%c[${logIndex}] %c[${type.toUpperCase()}] %c${message}`,
        `color: #757575ff; font-weight: normal; background-color: #242424ff; padding: 5px; padding-right: 0px; font-weight: bold;`,
        `color: ${logColors[type]}; font-weight: bold; background-color: #242424ff; padding: 5px; padding-right: 0px; font-weight: bold;`,
        'color: #c7c7c7ff; font-weight: normal; background-color: #242424ff; padding: 5px; margin-left: -5px;',
        ...extraStylesArray
    );
}

/** Disable the logger. */
export function disableLogger(): void {
    logDisabled = true;
}

/** Get the default logger stylesheet. */
export function getDefaultLoggerStylesheet(
    replaceable: {
        color?: string;
        'font-weight'?: string;
        'background-color'?: string;
        padding?: string;
        'padding-left'?: string;
        'padding-right'?: string;
        extra?: { name: string; value: string }[] | undefined;
    } = {}
): string {
    let extraStyles = '';
    if (replaceable.extra) {
        for (const style of replaceable.extra) {
            extraStyles += `${style.name}: ${style.value}; `;
        }
    }
    return `color: ${replaceable.color ?? '#c7c7c7ff'}; font-weight: ${replaceable['font-weight'] ?? 'normal'}; background-color: ${replaceable['background-color'] ?? '#242424ff'}; padding: ${replaceable.padding ?? '5px'}; padding-left: ${replaceable['padding-left'] ?? '0px'}; padding-right: ${replaceable['padding-right'] ?? '0px'}; ${extraStyles}`;
}
