import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGODB_URI!,
  corsOrigin: process.env.CORS_ORIGIN!,
  auth0: {
    domain: process.env.AUTH0_DOMAIN!,
    audience: process.env.AUTH0_AUDIENCE!,
  },
  aesKey: Buffer.from(process.env.APP_AES_KEY_BASE64!, 'base64'), // 32 bytes
};
