import { HttpsProxyAgent } from 'https-proxy-agent';
import { proxyUrl } from './tokens';

export const proxyAgent = new HttpsProxyAgent(proxyUrl);
