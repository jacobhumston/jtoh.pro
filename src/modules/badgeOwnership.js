import fs from 'node:fs';
import flatCache from 'flat-cache';

const cache = flatCache.load('badgeOwners', 'cache/');

//                                             // User Id                            // Badge id(s) (split via a comma)
const url = 'https://badges.roblox.com/v1/users/{userId}/badges/awarded-dates?badgeIds={badgeIds}';
