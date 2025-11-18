/**
 * This file handles cron tasks using the "cron" npm module.
 *
 * Authored by Jacob Humston
 */
import { convertTo, type AvailableConversions } from '@jacobhumston/tc.js';
import { CronJob, CronTime } from 'cron';
import { v4 } from 'uuid';

const tasks: Array<{
    name: string;
    description: string;
    cron: CronJob<null, unknown>;
    id: string;
    temporary: boolean;
}> = [];

/**
 * Create a new task.
 * @param name Name of this task.
 * @param description Description of this task.
 * @param time Cron time to run this task.
 * @param task The task to run.
 * @param temporaryCheck An optional callback to provide that will be called as a check. Once the callback returns `true`, the task will be deleted.
 * @returns The created cron job.
 */
export function createTask(
    name: string,
    description: string,
    time: AvailableConversions,
    task: ConstructorParameters<typeof CronJob>[1],
    temporaryCheck?: () => boolean | Promise<boolean> | undefined
) {
    /** Small util function to get the next cron execution date. */
    const getCronDate = () => new Date(Date.now() + convertTo(time, 'milliseconds'));
    const cron = new CronJob(getCronDate(), task);
    const id = v4();

    // Add a callback that allows the cron to continue next execution
    cron.addCallback(async function () {
        if (temporaryCheck) {
            if ((await temporaryCheck()) === true) {
                const foundIndex = tasks.findIndex((task) => task.id === id);
                tasks.splice(foundIndex, 1);
                return;
            }
        }
        cron.setTime(new CronTime(getCronDate()));
        cron.start();
    });

    cron.waitForCompletion = true;
    cron.start();

    tasks.push({ name, description, cron, id, temporary: temporaryCheck === undefined ? false : true });
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
