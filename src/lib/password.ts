import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_PREFIX = "scrypt";
const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `${SCRYPT_PREFIX}$v1$${salt}$${derivedKey}`;
}

export function isPasswordHash(value: string): boolean {
  return value.startsWith(`${SCRYPT_PREFIX}$`);
}

/** Verifies current scrypt hashes and supports legacy plaintext records for migration. */
export function verifyPassword(password: string, storedValue: string): boolean {
  if (!isPasswordHash(storedValue)) {
    const expected = Buffer.from(storedValue);
    const actual = Buffer.from(password);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  const [, version, salt, expectedHex] = storedValue.split("$");
  if (version !== "v1" || !salt || !expectedHex || expectedHex.length !== SCRYPT_KEY_LENGTH * 2) {
    return false;
  }

  const expected = Buffer.from(expectedHex, "hex");
  const actual = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
