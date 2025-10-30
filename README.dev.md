# Developer guide (local)

Quick steps to run and test the project locally for development.

Prerequisites
- Node.js >= 18 (Node 20 recommended)
- npm (uses package-lock.json)

Install dependencies

```powershell
npm install
```

Run in development mode (Next.js App Router)

```powershell
npm run dev
# open http://localhost:3000
```

Run production build + start

```powershell
npm run build
npm run start
```

Run TypeScript check

```powershell
npx tsc --noEmit
```

Run unit tests (Vitest)

```powershell
npm test
# or
npx vitest run
```

Run the smoke tests (expects server to be running on :3000)

```powershell
node scripts/smoke-claimants.js
```

Notes
- The project uses a small JSON-backed store at `data/claimants.json` for local development. Back up or commit data before running tests that mutate it.
- CI runs typecheck, unit tests, build, starts a production server in the runner, performs a health check, then runs the claimants smoke test.
