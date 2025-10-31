#!/usr/bin/env node
/*
  Simple migration runner: reads DATABASE_URL from env and runs the SQL in migrations/create_claimants.sql
  Usage:
    - set env var DATABASE_URL (Postgres connection string) and run: node ./scripts/migrate.js
    - or run via npm: DATABASE_URL=... npm run migrate

  The script is intentionally conservative: it exits with a helpful message if DATABASE_URL is not set.
*/

const fs = require('fs')
const path = require('path')

async function main() {
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_URL
  if (!databaseUrl) {
    console.error('\nNo DATABASE_URL or SUPABASE_DATABASE_URL found in environment. Migration cancelled.')
    console.error('Set DATABASE_URL to your Postgres connection string and re-run. Example:')
    console.error("  $env:DATABASE_URL='postgres://user:pass@host:5432/dbname'; npm run migrate")
    process.exit(1)
  }

  // Lazy-load pg so the script still exists even if `pg` not installed.
  let { Client } = require('pg')

  const migrationsDir = path.join(process.cwd(), 'migrations')
  if (!fs.existsSync(migrationsDir)) {
    console.error('Migrations directory not found at', migrationsDir)
    process.exit(1)
  }

  const sqlFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()
  if (sqlFiles.length === 0) {
    console.error('No .sql migration files found in', migrationsDir)
    process.exit(1)
  }

  const client = new Client({ connectionString: databaseUrl })
  try {
    console.log('Connecting to database...')
    await client.connect()

    for (const file of sqlFiles) {
      const sqlPathFile = path.join(migrationsDir, file)
      console.log('Running migration:', sqlPathFile)
      const sql = fs.readFileSync(sqlPathFile, 'utf-8')
      try {
        await client.query('BEGIN')
        await client.query(sql)
        await client.query('COMMIT')
        console.log('Applied:', file)
      } catch (err) {
        try { await client.query('ROLLBACK') } catch (e) { /* ignore */ }
        console.error('Migration failed for', file, ':', err.message || err)
        process.exit(2)
      }
    }

    console.log('All migrations applied successfully.')
    process.exit(0)
  } catch (err) {
    console.error('Migration runner failed:', err.message || err)
    process.exit(2)
  } finally {
    try { await client.end() } catch (e) { /* ignore */ }
  }
}

main()
