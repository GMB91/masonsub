# Mason Vector - Scripts

This directory contains utility scripts for the Mason Vector application.

## Type Verification Script

### `verify-type-integrity.ts`

Automatically validates consistency between your Supabase schema, TypeScript interfaces, and Zod schemas.

**What it checks:**

1. **File Existence**: Ensures all required type files exist
2. **Table Coverage**: Verifies every Supabase table has:
   - A TypeScript interface in `entities.ts`
   - A Zod schema in `zodSchemas.ts`
3. **SchemaMap**: Validates the SchemaMap has entries for all tables
4. **Validation Helpers**: Confirms `validateForTable` and `safeValidateForTable` are available
5. **Field Consistency**: Sample checks that schemas have proper structure

**Usage:**

```bash
# Run the verification
npx tsx scripts/verify-type-integrity.ts

# Or add to package.json:
npm run verify-types
```

**Expected Output:**

```
🔍 Mason Vector Schema Verification
====================================

📁 File Check:
   Entities file:  ✅ ./src/types/entities.ts
   Zod schemas:    ✅ ./src/types/zodSchemas.ts
   Database types: ✅ ./src/types/database.types.ts

📊 Coverage Summary:
   Supabase Tables: 20
   TypeScript Types: 20
   Zod Schemas: 20

🧩 Table Coverage Check:

   Table Name                  Type    Schema  Status
   ───────────────────────────────────────────────────
   claimants                   ✅      ✅      ✅
   reminders                   ✅      ✅      ✅
   ...

🗺️  SchemaMap Verification:

   SchemaMap contains 20 entries
   ✅ All tables present in SchemaMap

🛠️  Validation Helpers Check:

   validateForTable:     ✅
   safeValidateForTable: ✅

🔬 Field Consistency Sample Check:

   Claimant             15 fields ✅
   Reminder             10 fields ✅
   ...

============================================================

✅ ALL CHECKS PASSED!

   Your type system is fully synchronized:
   • 20 Supabase tables
   • 20 TypeScript interfaces
   • 20 Zod schemas
   • SchemaMap complete
   • Validation helpers available

   Ready for production! 🚀
```

**CI/CD Integration:**

Add to your GitHub Actions workflow:

```yaml
- name: Verify Type Integrity
  run: npx tsx scripts/verify-type-integrity.ts
```

Or to your `package.json`:

```json
{
  "scripts": {
    "verify-types": "tsx scripts/verify-type-integrity.ts",
    "prebuild": "npm run verify-types"
  }
}
```

**Exit Codes:**

- `0`: All checks passed
- `1`: Issues found (see output for details)

**What to do if checks fail:**

1. **Missing Type**: Add the TypeScript interface to `src/types/entities.ts`
2. **Missing Schema**: Add the Zod schema to `src/types/zodSchemas.ts`
3. **SchemaMap**: Update the SchemaMap in `zodSchemas.ts` to include the missing table
4. **Validation Helpers**: Ensure `validateForTable` and `safeValidateForTable` are exported

---

## Future Scripts

Additional utility scripts will be documented here as they are added.
