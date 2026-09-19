import crypto from 'crypto';

function getEncryptionKey(): crypto.CipherKey {
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }

  const normalizedKey = Buffer.from(encryptionKey);

  if (normalizedKey.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 bytes for aes-256-cbc');
  }

  return normalizedKey;
}

function encryptData(data: Record<string, unknown>, key: crypto.CipherKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decryptData(encryptedData: string, key: crypto.CipherKey) {
  const [iv, encrypted] = encryptedData.split(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

export { encryptData, decryptData, getEncryptionKey };
