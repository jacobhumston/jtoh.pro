export const gitHash = (await Bun.$`git rev-parse --short HEAD`.text('utf-8')).trim();
