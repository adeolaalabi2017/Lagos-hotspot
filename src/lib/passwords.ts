import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const SCRYPT_COST = 2 ** 14;

export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(plain, salt, KEY_LENGTH, { N: SCRYPT_COST });
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  if (!stored.startsWith("scrypt$")) return false;
  const parts = stored.split("$");
  if (parts.length !== 3) return false;
  const [, saltHex, keyHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(keyHex, "hex");
  const derived = scryptSync(plain, salt, expected.length, { N: SCRYPT_COST });
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
