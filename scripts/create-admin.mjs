/* Create or update a dashboard user.

   Usage:
     node scripts/create-admin.mjs <email> <password> [role] [name]

   Roles: owner (default) | admin | editor | fulfilment

   With Sanity configured it writes a `user` document. Without it, it prints
   the env lines for the single bootstrap owner account.

   The hash format must match lib/auth/password.ts: scrypt$<salt>$<key>, both
   base64, 64-byte key, 16-byte salt. */

import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { createClient } from "@sanity/client";

const scrypt = promisify(scryptCb);

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const ROLES = ["owner", "admin", "editor", "fulfilment"];

const [, , email, password, role = "owner", ...nameParts] = process.argv;

if (!email || !password) {
  console.error(
    "Usage: node scripts/create-admin.mjs <email> <password> [role] [name]",
  );
  process.exit(1);
}
if (!ROLES.includes(role)) {
  console.error(`Unknown role "${role}". Use one of: ${ROLES.join(", ")}`);
  process.exit(1);
}
if (password.length < 10) {
  console.error("Use a password of at least 10 characters.");
  process.exit(1);
}

const name = nameParts.join(" ") || email.split("@")[0];
const salt = randomBytes(SALT_LENGTH);
const key = await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH);
const hash = `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_WRITE_TOKEN;

if (projectId && token) {
  const client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2024-10-01",
    token,
    useCdn: false,
  });

  const id = `user.${email.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  await client.createOrReplace({
    _id: id,
    _type: "user",
    name,
    email: email.toLowerCase(),
    role,
    passwordHash: hash,
    active: true,
  });
  console.log(`Saved ${role} "${name}" <${email.toLowerCase()}> as ${id}.`);
} else {
  console.log(
    [
      "Sanity is not configured, so here is the bootstrap owner account.",
      "Add these to .env.local (the hash, never the password):",
      "",
      `ADMIN_EMAIL=${email.toLowerCase()}`,
      `ADMIN_NAME=${name}`,
      `ADMIN_PASSWORD_HASH=${hash}`,
      "",
    ].join("\n"),
  );
}
