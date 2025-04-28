import { S3Client } from 'bun';
import { cloudflareS3 } from './tokens';

export const s3 = new S3Client({
    accessKeyId: cloudflareS3.keyId,
    secretAccessKey: cloudflareS3.accessKey,
    bucket: 'jtoh-pro-r2',
    endpoint: 'https://9f0600f3ffb703aaf17e92ddb3d32e31.r2.cloudflarestorage.com'
});
