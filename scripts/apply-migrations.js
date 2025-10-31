#!/usr/bin/env node
"use strict";

const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const { Client } = require("pg");

async function main() {
  const migrationsDir = path.join(__dirname, "..", "migrations");

  // CLI flags
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run") || argv.includes("-n");
  const autoYes = argv.includes("--yes") || argv.includes("-y");
  const force = argv.includes("--force") || argv.includes("-f");
  const jsonOut = argv.includes("--json") || argv.includes("-j");

  let dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_DB_URL;

  // Attempt to read an optional MCP creds file at .mcp/supabase.json (same pattern as src/lib/supabaseClient.ts)
  try {
    const mcpPath = path.join(process.cwd(), '.mcp', 'supabase.json');
    if (!dbUrl && fs.existsSync(mcpPath)) {
      const raw = fs.readFileSync(mcpPath, 'utf8');
      const mcp = JSON.parse(raw);
      // support a few common field names that teams may use for a DB connection string
      dbUrl = dbUrl || mcp.databaseUrl || mcp.dbUrl || mcp.database_url || mcp.pg_connection || mcp.connectionString || mcp.postgresUrl || mcp.db || null;
    }
  } catch (e) {
    // ignore parse errors; we'll fall back to env vars and print guidance below
  }

  if (!dbUrl) {
    console.error("ERROR: No DATABASE_URL, SUPABASE_DATABASE_URL, SUPABASE_DB_URL, or .mcp/supabase.json db field found.");
    console.error("Set DATABASE_URL to your Supabase Postgres connection string and re-run, or add a 'databaseUrl' field to .mcp/supabase.json.");
    console.error("Example .mcp/supabase.json (do NOT commit secrets): { \"databaseUrl\": \"postgres://user:pass@host:5432/dbname\" }");
    process.exit(1);
  }

  // Safety check: refuse to run against obvious production Supabase hosts unless --force is provided
  try {
    const parsed = new URL(dbUrl);
    const host = parsed.hostname || '';
    if (!force && /(?:^|\.)supabase\.co$/.test(host)) {
      console.error("Refusing to run migrations against a Supabase-hosted database by default:", host);
      console.error("If you really mean to run this against that database, re-run the command with --force to bypass this check.");
      process.exit(3);
    }
  } catch (e) {
    // ignore URL parse errors; we'll let pg client surface issues later
  }

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    // Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const files = (await fsp.readdir(migrationsDir))
      .filter((f) => f.endsWith(".sql"))
      .sort();

    if (dryRun) {
      const pending = [];
      for (const file of files) {
        const name = file;
        const { rows } = await client.query("SELECT 1 FROM migrations WHERE name = $1", [name]);
        if (!rows.length) pending.push(name);
      }
      if (jsonOut) {
        console.log(JSON.stringify({ pending, timestamp: new Date().toISOString() }, null, 2));
      } else {
        console.log("--dry-run: listing pending migrations (no changes will be made)");
        if (pending.length === 0) {
          console.log("No pending migrations.");
        } else {
          console.log("Pending migrations:");
          pending.forEach((p) => console.log(" - ", p));
        }
      }
      await client.end();
      process.exit(0);
    }

    // helper for interactive prompts
    const askYesNo = (question) => {
      return new Promise((resolve) => {
        if (autoYes) return resolve(true);
        const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
        rl.question(question + ' (y/N) ', (ans) => {
          rl.close();
          const ok = /^y(es)?$/i.test(ans.trim());
          resolve(ok);
        });
      });
    };

    for (const file of files) {
      const name = file;
      const { rows } = await client.query("SELECT 1 FROM migrations WHERE name = $1", [name]);
      if (rows.length) {
        console.log(`skipping ${name} (already applied)`);
        continue;
      }

      console.log(`pending: ${name}`);
      if (!autoYes) {
        const ok = await askYesNo(`Apply migration ${name}?`);
        if (!ok) {
          console.log(`skipping ${name} by user choice`);
          continue;
        }
      }

      console.log(`applying ${name} ...`);
      const sql = await fsp.readFile(path.join(migrationsDir, file), "utf8");
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO migrations(name) VALUES($1)", [name]);
        await client.query("COMMIT");
        if (jsonOut) {
          console.log(JSON.stringify({ applied: name, timestamp: new Date().toISOString() }));
        } else {
          console.log(`applied ${name}`);
        }
      } catch (err) {
        await client.query("ROLLBACK");
        if (jsonOut) {
          console.error(JSON.stringify({ error: true, file: name, message: err && err.message ? err.message : String(err) }));
        } else {
          console.error(`ERROR applying ${name}:`, err && err.message ? err.message : err);
        }
        await client.end();
        process.exit(2);
      }
    }

    console.log("All migrations applied (or already up-to-date).\n");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
