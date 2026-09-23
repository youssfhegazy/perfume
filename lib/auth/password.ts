import "server-only";

import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

/* Password hashing with Node's built-in scrypt — a memory-hard KDF, so no
   third-party dependency is needed. Stored as `scrypt$<salt>$<hash>` in base64
   so the format can be recognised (and migrated) later. */

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const PREFIX = "scrypt";

export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_LENGTH);
  const key = await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH);
  return `${PREFIX}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [prefix, saltB64, keyB64] = stored.split("$");
  if (prefix !== PREFIX || !saltB64 || !keyB64) return false;

  let expected: Buffer;
  try {
    expected = Buffer.from(keyB64, "base64");
  } catch {
    return false;
  }
  if (expected.length !== KEY_LENGTH) return false;

  const actual = await scrypt(
    password.normalize("NFKC"),
    Buffer.from(saltB64, "base64"),
    KEY_LENGTH,
  );
  // Constant time — never leak how much of the hash matched.
  return timingSafeEqual(actual, expected);
}
