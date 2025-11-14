/**
 * Handle the application authorized event.
 *
 * Authored by Jacob Humston
 */
import type { Event } from 'dressed';

export default async function (event: Event<'ApplicationAuthorized'>) {
    console.log(event.user.username, 'just added me to', event.guild ? event.guild.name : 'themself');
}
