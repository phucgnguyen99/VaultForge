import crypto from 'crypto';
import { config } from './config';

// encrypt/ decrypt JSON payloads using AES-256-GCM with a fresh random IV per encryption
// Only ciphertext in the database, no plaintext secrets (like password) should be stored

const KEY = config.aesKey; // 32 bytes

/*
encryptJson(payload)
    IV: 12 random bytes (crypto.randomBytes(12)), required by GCM.

    Cipher created with aes-256-gcm, key = config.aesKey.

    Serializes the payload to a UTF-8 Buffer and encrypts.

    Returns { iv, data, tag } as base64 strings.
*/
export function encryptJson(payload: unknown) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
    const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
        iv: iv.toString('base64'),
        data: ciphertext.toString('base64'),
        tag: tag.toString('base64'),
    };
}

/*
decryptJson({iv, data, tag})

    Reverses the process and returns the original JSON object.
*/
export function decryptJson(enc: {iv:string; data:string; tag:string}) {
    const iv = Buffer.from(enc.iv, 'base64');
    const data = Buffer.from(enc.data, 'base64');
    const tag = Buffer.from(enc.tag, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
    return JSON.parse(plaintext.toString('utf8'));
}
