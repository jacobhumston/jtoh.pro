/**
 * This file handles cron tasks using the "cron" npm module.
 *
 * Authored by Jacob Humston
 */
import { convertTo, type AvailableConversions } from '@jacobhumston/tc.js';
import { CronJob } from 'cron';

const tasks: Array<{ name: string; description: string; cron: CronJob<null, unknown> }> = [];

/**
 * Create a new task.
 * @param name Name of this task.
 * @param description Description of this task.
 * @param time Cron time to run this task.
 * @param task The task to run.
 * @returns The created cron job.
 */
export function createTask(
    name: string,
    description: string,
    time: AvailableConversions,
    task: ConstructorParameters<typeof CronJob>[1]
) {
    const cron = new CronJob(new Date(convertTo(time, 'milliseconds')), task, undefined, true);
    tasks.push({ name, description, cron });
    return cron;
}

/**
 * Get a list of all tasks.
 * This can be used to modify jobs, etc.
 * @returns List of tasks.
 */
export function getTasks(): typeof tasks {
    return tasks;
}
