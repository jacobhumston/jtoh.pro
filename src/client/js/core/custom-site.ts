import { waitForPageLoad } from '../libs/util';

export default async function () {
    await waitForPageLoad();

    console.log('Custom site loaded.');
}
