import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); // In a real application, use a secure method to generate and store this key
const iv = crypto.randomBytes(16);

// Function to encrypt data
export const encrypt = (text) => {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
};

// Function to decrypt data
export const decrypt = (text) => {
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// Function to hash password
export const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Function to compare password with hashed password
export const comparePassword = (password, hash) => {
  const hashedPassword = hashPassword(password);
  return hashedPassword === hash;
};
