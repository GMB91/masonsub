# Automated Type Maintenance

This directory contains scripts for maintaining type safety and synchronization between Supabase, TypeScript, and Zod schemas.

---

## 🔄 Auto-Update Script

### `update-database-types.ts`

Automatically detects Supabase schema changes, regenerates type definitions, and runs verification.

**Features:**
- ✅ Detects schema changes in Supabase
- ✅ Regenerates `database.types.ts` from live schema
- ✅ Creates backup before changes (safety first)
- ✅ Runs verification automatically
- ✅ Optional auto-commit to git
- ✅ Dry-run mode for testing
- ✅ Detailed logging and error handling

**Usage:**

```bash
# Standard update (regenerate + verify)
npm run update:types

# Dry run (see what would happen)
npm run update:types -- --dry-run

# With auto-commit
AUTO_COMMIT=true npm run update:types
```

**Environment Variables:**

```env
# Required
SUPABASE_PROJECT_ID=your-project-id-here

# Optional
AUTO_COMMIT=true    # Automatically commit changes to git
```

**Process Flow:**

```
1. Validate Environment
   ├─ Check SUPABASE_PROJECT_ID
   └─ Verify Supabase CLI available

2. Backup Existing Types
   ├─ Copy database.types.ts → database.types.backup.ts
   └─ Safety net for rollback

3. Regenerate Database Types
   ├─ Query Supabase for current schema
   ├─ Generate TypeScript definitions
   └─ Write to database.types.ts

4. Detect Changes
   ├─ Compare new vs backup
   └─ Report differences

5. Run Type Verification
   ├─ Execute verify-type-integrity.ts
   ├─ Check all tables have types/schemas
   └─ Validate SchemaMap

6. Auto-Commit (Optional)
   ├─ Stage database.types.ts
   ├─ Create descriptive commit
   └─ Log for manual push

7. Cleanup & Summary
   ├─ Remove backup file
   └─ Display results
```

**Exit Codes:**
- `0`: Success - types updated and verified
- `1`: Failure - check logs for details

**Safety Features:**
1. **Backup First**: Always creates backup before changes
2. **Rollback on Error**: Restores backup if generation fails
3. **Verification Gate**: Won't commit if verification fails
4. **Dry Run Mode**: Test without making changes
5. **Manual Review**: Auto-commit is optional

**What to do if verification fails:**

The script will preserve the new types and show you what needs manual attention:

```
⚠️  Type verification failed after schema update

Manual action required:
1. Review the changes in database.types.ts
2. Add missing interfaces to src/types/entities.ts
3. Add missing schemas to src/types/zodSchemas.ts
4. Update SchemaMap in zodSchemas.ts
5. Run 'npm run verify-types' to confirm
```

**Example Output:**

```
============================================================
🔁 Supabase Type Maintenance & Self-Healing Sync
============================================================

============================================================
Step 1: Environment Validation
============================================================
✅ Project ID: abcd1234...

============================================================
Step 2: Checking Supabase CLI
============================================================
✅ Supabase CLI available

============================================================
Step 3: Backup Existing Types
============================================================
ℹ️  Creating backup of existing database.types.ts
✅ Backup created

============================================================
Step 4: Regenerate Database Types
============================================================
ℹ️  Generating types from Supabase schema...
✅ database.types.ts regenerated successfully

============================================================
Step 5: Change Detection
============================================================
⚠️  Schema changes detected!

============================================================
Step 6: Type Integrity Verification
============================================================
ℹ️  Running type integrity checks...
✅ Type verification passed!

============================================================
Step 7: Auto-Commit Changes
============================================================
ℹ️  Committing updated types...
✅ Changes committed to git

============================================================
✅ Process Complete - Success!
============================================================

📊 Summary:
   ✅ Database types regenerated
   ✅ Schema changes detected
   ✅ Type verification passed
   ✅ All types synchronized
   ✅ Changes committed to git

🎯 Next Steps:
   1. Review the changes in database.types.ts
   2. Test your application with the updated types
   3. Deploy when ready
```

---

## ✅ Verification Script

### `verify-type-integrity.ts`

Validates consistency between Supabase schema, TypeScript interfaces, and Zod schemas.

**See main README.md for full verification documentation.**

**Quick Usage:**

```bash
npm run verify-types
```

---

## 📦 Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "update:types": "tsx scripts/update-database-types.ts",
    "verify-types": "tsx scripts/verify-type-integrity.ts",
    "prebuild": "npm run verify-types"
  }
}
```

---

## 🤖 CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/sync-supabase-types.yml`:

```yaml
name: Sync Supabase Types

on:
  schedule:
    - cron: "0 0 * * *"  # Daily at midnight
  workflow_dispatch:      # Manual trigger

jobs:
  sync-types:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      
      - name: Install dependencies
        run: npm ci
      
      - name: Update Supabase types
        env:
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
          AUTO_COMMIT: "true"
        run: npm run update:types
      
      - name: Push changes
        if: success()
        run: |
          git config user.name "masonvector-bot"
          git config user.email "bot@masonvector.ai"
          git push origin main || echo "No changes to push"
      
      - name: Notify on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '⚠️ Supabase Type Sync Failed',
              body: 'The automated type sync detected schema changes that require manual review. Check the workflow logs for details.',
              labels: ['automated', 'type-safety', 'needs-review']
            })
```

**Secrets Required:**
- `SUPABASE_PROJECT_ID`: Your Supabase project ID

**What it does:**
1. Runs daily to check for schema changes
2. Regenerates types if changes detected
3. Runs verification
4. Auto-commits and pushes if successful
5. Creates an issue if manual review needed

---

## 🔔 Monitoring & Alerts

### Local Development

Run manually whenever you make database changes:

```bash
npm run update:types
```

### Continuous Monitoring

The GitHub Action will:
- Run daily automatically
- Can be triggered manually
- Creates issues for failures
- Commits changes with descriptive messages

### Slack/Discord Notifications (Optional)

Add to your workflow:

```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "⚠️ Supabase type sync failed - manual review required"
      }
```

---

## 🛠️ Troubleshooting

### "Missing SUPABASE_PROJECT_ID"

Add to `.env.local`:
```env
SUPABASE_PROJECT_ID=your-project-id
```

Find your project ID in Supabase Dashboard → Settings → General → Reference ID

### "Supabase CLI not found"

The script will install it automatically via `npx`. Ensure you have internet connection.

### "Type verification failed"

This means your schema changed but you haven't updated the corresponding TypeScript/Zod definitions. Follow the manual steps shown in the error output.

### "git commit failed"

Ensure git is configured:
```bash
git config user.name "Your Name"
git config user.email "your@email.com"
```

---

## 📚 Related Documentation

- **Type System Overview:** `../logs/TYPE_SYSTEM_COMPLETE.md`
- **Verification Guide:** `./README.md` (this file, previous section)
- **Usage Examples:** `../src/lib/SUPABASE_USAGE_EXAMPLES.ts`

---

## 🎯 Best Practices

1. **Run after schema changes**: Always run `npm run update:types` after modifying your Supabase schema
2. **Review diffs**: Use `git diff` to review type changes before committing
3. **Test locally**: Use `--dry-run` to preview changes without modifying files
4. **Keep CI enabled**: Let automation catch schema drift
5. **Document changes**: Add comments when adding new tables or columns

---

**Generated:** November 5, 2025  
**Last Updated:** November 5, 2025
