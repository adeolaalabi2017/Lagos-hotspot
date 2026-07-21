#!/usr/bin/env node
/**
 * deploy-check.js
 *
 * Validates the environment contract before a production deploy.
 *
 * Usage:
 *   node scripts/deploy-check.js
 *
 * Exit codes:
 *   0  — all checks pass
 *   1  — one or more checks failed
 */

const MIN_SECRET_LENGTH = 32;
const env = process.env;

function check(name, pass, hint) {
  if (pass) {
    console.log(`  \u2713 ${name}`);
  } else {
    console.error(`  \u2717 ${name}`);
    if (hint) console.error(`    ${hint}`);
  }
  return pass;
}

function run() {
  const isProduction = env.NODE_ENV === "production";
  console.log(
    `\nEkoSpot deploy check  [NODE_ENV=${env.NODE_ENV ?? "(not set)"}]\n`
  );

  let allPassed = true;

  if (isProduction) {
    // ── AUTH_SECRET ──────────────────────────────────────────────────────
    const secret = env.AUTH_SECRET;
    const secretLen = secret ? secret.length : 0;
    allPassed =
      check(
        `AUTH_SECRET is set`,
        Boolean(secret),
        `Set AUTH_SECRET to a random string \u2265 ${MIN_SECRET_LENGTH} chars:\n` +
          `  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
      ) && allPassed;

    allPassed =
      check(
        `AUTH_SECRET length \u2265 ${MIN_SECRET_LENGTH}`,
        secretLen >= MIN_SECRET_LENGTH,
        `Current length: ${secretLen}. Generate a new value with:\n` +
          `  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
      ) && allPassed;

    // ── DATABASE_URL ─────────────────────────────────────────────────────
    const dbUrl = env.DATABASE_URL;
    allPassed =
      check(
        `DATABASE_URL is set`,
        Boolean(dbUrl),
        `Set DATABASE_URL to your production database connection string.\n` +
          `  Example: postgresql://USER:PASSWORD@HOST:5432/ekospot`
      ) && allPassed;

    allPassed =
      check(
        `DATABASE_URL is not the default dev SQLite path`,
        !dbUrl || !dbUrl.startsWith("file:"),
        `Detected local SQLite path in production. Set DATABASE_URL to a real database.`
      ) && allPassed;
  } else {
    console.log(
      "  (skipping production checks — NODE_ENV is not 'production')\n"
    );
  }

  console.log("\n" + "─".repeat(55));

  if (allPassed) {
    console.log("  All checks passed.\n");
    process.exit(0);
  } else {
    console.error("  One or more checks failed. Fix the issues above before deploying.\n");
    process.exit(1);
  }
}

run();
