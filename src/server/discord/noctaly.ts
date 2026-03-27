/**
 * This module exposes the Noctaly API.
 */
import { NoctalyClient } from '@noctaly/sdk';

import apiTokens from '@server/modules/tokens';

const noctaly = new NoctalyClient({ apiKey: apiTokens.noctalyAPIKey });

// jtoh.pro Discord Server ID
export default noctaly.guilds('1299365617362534420');
