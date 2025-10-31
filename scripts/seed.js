#!/usr/bin/env node
/*
  Seed script for the claimants table. Behavior:
  - If DATABASE_URL is set, use `pg` to upsert sample rows.
  - Else if SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are set, use @supabase/supabase-js to insert.
  - Otherwise abort with instructions.

  Usage examples (PowerShell):
    $env:DATABASE_URL='postgres://user:pass@host:5432/db'; npm run seed
    $env:SUPABASE_SERVICE_ROLE_KEY='service_role.x'; $env:NEXT_PUBLIC_SUPABASE_URL='https://...supabase.co'; npm run seed
*/

const sample = [
  { id: 'c-seed-1', org: 'demo', name: 'John Smith', first_name: 'John', last_name: 'Smith', email: 'john@example.com', city: 'Brisbane', amount: 5000, status: 'Researching', metadata: {} },
  { id: 'c-seed-2', org: 'demo', name: 'Sarah Jones', first_name: 'Sarah', last_name: 'Jones', email: 'sarah@example.com', city: 'Sydney', amount: 12000, status: 'In Progress', metadata: {} },
]

async function runPg(url) {
  const { Client } = require('pg')
  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    console.log('Connected to Postgres, upserting sample claimants...')
    for (const row of sample) {
      const query = `INSERT INTO public.claimants (id, org, name, first_name, last_name, email, phone, city, amount, status, metadata, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, now())
        ON CONFLICT (id) DO UPDATE SET
          org = EXCLUDED.org,
          name = EXCLUDED.name,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          city = EXCLUDED.city,
          amount = EXCLUDED.amount,
          status = EXCLUDED.status,
          metadata = EXCLUDED.metadata;`
      const vals = [row.id, row.org, row.name, row.first_name, row.last_name, row.email, row.phone || null, row.city || null, row.amount || null, row.status || null, JSON.stringify(row.metadata || {})]
      await client.query(query, vals)
      console.log('Upserted', row.id)
    }
    console.log('Seed complete.')
  } finally {
    await client.end()
  }
}

async function runSupabase(url, serviceKey) {
  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(url, serviceKey)
  console.log('Connected to Supabase, inserting sample claimants via service role...')
  for (const row of sample) {
    const { data, error } = await supabase.from('claimants').upsert(row, { onConflict: 'id' }).select()
    if (error) {
      console.error('Supabase insert error for', row.id, error.message || error)
    } else {
      console.log('Upserted', row.id)
    }
  }
  console.log('Seed complete (Supabase).')
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (dbUrl) {
    await runPg(dbUrl)
    return
  }

  if (supabaseUrl && serviceKey) {
    await runSupabase(supabaseUrl, serviceKey)
    return
  }

  console.error('\nNo DATABASE_URL or SUPABASE_SERVICE_ROLE_KEY+NEXT_PUBLIC_SUPABASE_URL found. Seed cancelled.')
  console.error('Set env vars and re-run. Example (PowerShell):')
  console.error("  $env:DATABASE_URL='postgres://user:pass@host:5432/db'; npm run seed")
  console.error("  or set SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL and run: npm run seed")
  process.exit(1)
}

main().catch((e) => { console.error('Seed failed:', e.message || e); process.exit(2) })
