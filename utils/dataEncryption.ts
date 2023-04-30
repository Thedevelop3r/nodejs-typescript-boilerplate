import crypto from 'crypto';
// Encrypt the data using a secret key
function encryptData(data: Object, key:crypto.CipherKey) {
  const iv = crypto.randomBytes(16); // Generate a random IV
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decryptData(encryptedData: String, key: crypto.CipherKey) {
    // Decrypt the data
  const [iv, encrypted] = encryptedData.split(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

export { encryptData, decryptData };
