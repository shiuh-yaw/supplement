import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/** AES-256-GCM. Output: iv (12) + tag (16) + ciphertext. Tampering makes decrypt throw. */
export function encryptJson(value: unknown, key: Buffer, aad: string): Uint8Array<ArrayBuffer> {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(aad));
  const data = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return new Uint8Array(Buffer.concat([iv, cipher.getAuthTag(), data]));
}

/** `aad` binds a record to its account, so a ciphertext copied to another account won't decrypt. */
export function decryptJson<T>(payload: Uint8Array, key: Buffer, aad: string): T {
  const buf = Buffer.from(payload);
  const decipher = createDecipheriv("aes-256-gcm", key, buf.subarray(0, 12));
  decipher.setAAD(Buffer.from(aad));
  decipher.setAuthTag(buf.subarray(12, 28));
  const text = Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString("utf8");
  return JSON.parse(text) as T;
}
