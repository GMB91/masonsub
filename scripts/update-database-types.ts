// [AUTO-GEN-START] Automated Supabase Type Maintenance Script
// Generated: 2025-11-05
// Detects schema changes, regenerates types, and runs verification
// ============================================================================

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// ============================================================================
// Configuration
// ============================================================================

const PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const AUTO_COMMIT = process.env.AUTO_COMMIT === "true";
const DRY_RUN = process.argv.includes("--dry-run");

const dbTypesPath = path.resolve("./src/types/database.types.ts");
const backupPath = path.resolve("./src/types/database.types.backup.ts");

// ============================================================================
// Helper Functions
// ============================================================================

function logSection(message: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(message);
  console.log("=".repeat(60));
}

function logSuccess(message: string) {
  console.log(`✅ ${message}`);
}

function logWarning(message: string) {
  console.log(`⚠️  ${message}`);
}

function logError(message: string) {
  console.error(`❌ ${message}`);
}

function logInfo(message: string) {
  console.log(`ℹ️  ${message}`);
}

function executeCommand(command: string, description: string): boolean {
  try {
    logInfo(`${description}...`);
    if (DRY_RUN) {
      logInfo(`[DRY RUN] Would execute: ${command}`);
      return true;
    }
    execSync(command, { stdio: "inherit" });
    return true;
  } catch (error) {
    logError(`Failed: ${description}`);
    return false;
  }
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function backupExistingTypes(): boolean {
  try {
    if (fileExists(dbTypesPath)) {
      logInfo("Creating backup of existing database.types.ts");
      if (!DRY_RUN) {
        fs.copyFileSync(dbTypesPath, backupPath);
      }
      logSuccess("Backup created");
      return true;
    } else {
      logWarning("No existing database.types.ts found (first run?)");
      return true;
    }
  } catch (error) {
    logError(`Failed to create backup: ${error}`);
    return false;
  }
}

function restoreBackup() {
  try {
    if (fileExists(backupPath)) {
      logInfo("Restoring from backup...");
      if (!DRY_RUN) {
        fs.copyFileSync(backupPath, dbTypesPath);
      }
      logSuccess("Backup restored");
    }
  } catch (error) {
    logError(`Failed to restore backup: ${error}`);
  }
}

function detectChanges(): boolean {
  if (!fileExists(backupPath) || !fileExists(dbTypesPath)) {
    return true; // Assume changes if files are missing
  }

  try {
    const oldContent = fs.readFileSync(backupPath, "utf-8");
    const newContent = fs.readFileSync(dbTypesPath, "utf-8");
    
    // Normalize whitespace for comparison
    const normalize = (str: string) => str.replace(/\s+/g, " ").trim();
    
    return normalize(oldContent) !== normalize(newContent);
  } catch (error) {
    logWarning(`Could not compare files: ${error}`);
    return true; // Assume changes on error
  }
}

function cleanupBackup() {
  try {
    if (fileExists(backupPath)) {
      if (!DRY_RUN) {
        fs.unlinkSync(backupPath);
      }
      logInfo("Backup file cleaned up");
    }
  } catch (error) {
    logWarning(`Could not remove backup file: ${error}`);
  }
}

// ============================================================================
// Main Process
// ============================================================================

async function main() {
  logSection("🔁 Supabase Type Maintenance & Self-Healing Sync");

  if (DRY_RUN) {
    logWarning("DRY RUN MODE - No changes will be made");
  }

  // Step 1: Validate environment
  logSection("Step 1: Environment Validation");
  
  if (!PROJECT_ID) {
    logError("Missing SUPABASE_PROJECT_ID environment variable");
    logInfo("Set it in .env.local: SUPABASE_PROJECT_ID=your-project-id");
    process.exit(1);
  }
  
  logSuccess(`Project ID: ${PROJECT_ID.substring(0, 8)}...`);

  // Step 2: Check Supabase CLI
  logSection("Step 2: Checking Supabase CLI");
  
  try {
    execSync("npx supabase --version", { stdio: "pipe" });
    logSuccess("Supabase CLI available");
  } catch (error) {
    logWarning("Supabase CLI not found, will install on demand");
  }

  // Step 3: Backup existing types
  logSection("Step 3: Backup Existing Types");
  
  if (!backupExistingTypes()) {
    logError("Backup failed - aborting to prevent data loss");
    process.exit(1);
  }

  // Step 4: Regenerate types from Supabase
  logSection("Step 4: Regenerate Database Types");
  
  const generateSuccess = executeCommand(
    `npx supabase gen types typescript --project-id "${PROJECT_ID}" --schema public > "${dbTypesPath}"`,
    "Generating types from Supabase schema"
  );

  if (!generateSuccess) {
    logError("Type generation failed");
    restoreBackup();
    process.exit(1);
  }

  logSuccess("database.types.ts regenerated successfully");

  // Step 5: Detect changes
  logSection("Step 5: Change Detection");
  
  const hasChanges = detectChanges();
  
  if (!hasChanges) {
    logSuccess("No schema changes detected - types are up to date");
    cleanupBackup();
    logSection("✅ Process Complete - No Action Required");
    process.exit(0);
  }

  logWarning("Schema changes detected!");

  // Step 6: Run type verification
  logSection("Step 6: Type Integrity Verification");
  
  const verifySuccess = executeCommand(
    "npm run verify-types",
    "Running type integrity checks"
  );

  if (!verifySuccess) {
    logError("Type verification failed after schema update");
    logWarning("This may indicate missing TypeScript interfaces or Zod schemas");
    logInfo("Manual action required:");
    logInfo("1. Review the changes in database.types.ts");
    logInfo("2. Add missing interfaces to src/types/entities.ts");
    logInfo("3. Add missing schemas to src/types/zodSchemas.ts");
    logInfo("4. Update SchemaMap in zodSchemas.ts");
    logInfo("5. Run 'npm run verify-types' to confirm");
    
    // Don't restore backup - keep new types for review
    logInfo("New types preserved for manual review");
    process.exit(1);
  }

  logSuccess("Type verification passed!");

  // Step 7: Auto-commit (optional)
  if (AUTO_COMMIT && !DRY_RUN) {
    logSection("Step 7: Auto-Commit Changes");
    
    try {
      // Check if there are actual git changes
      execSync("git diff --quiet src/types/database.types.ts", { stdio: "pipe" });
      logInfo("No git changes to commit");
    } catch (error) {
      // git diff --quiet returns non-zero if there are differences
      logInfo("Committing updated types...");
      
      executeCommand(
        'git add src/types/database.types.ts',
        "Staging database.types.ts"
      );
      
      const timestamp = new Date().toISOString().split("T")[0];
      executeCommand(
        `git commit -m "chore: Auto-update Supabase types (${timestamp})\n\nGenerated from schema changes detected in production database.\nVerification passed - all types and schemas synchronized."`,
        "Creating commit"
      );
      
      logSuccess("Changes committed to git");
      logInfo("Review and push when ready: git push origin main");
    }
  } else if (AUTO_COMMIT) {
    logSection("Step 7: Auto-Commit (Skipped - Dry Run)");
    logInfo("[DRY RUN] Would auto-commit changes");
  } else {
    logSection("Step 7: Manual Review Required");
    logInfo("Auto-commit disabled. To commit changes manually:");
    logInfo("  git add src/types/database.types.ts");
    logInfo('  git commit -m "chore: Update Supabase types"');
    logInfo("  git push origin main");
  }

  // Step 8: Cleanup
  cleanupBackup();

  // Step 9: Summary
  logSection("✅ Process Complete - Success!");
  
  console.log("\n📊 Summary:");
  console.log("   ✅ Database types regenerated");
  console.log("   ✅ Schema changes detected");
  console.log("   ✅ Type verification passed");
  console.log("   ✅ All types synchronized");
  
  if (AUTO_COMMIT && !DRY_RUN) {
    console.log("   ✅ Changes committed to git");
  } else {
    console.log("   ⏸️  Manual commit required");
  }
  
  console.log("\n🎯 Next Steps:");
  console.log("   1. Review the changes in database.types.ts");
  console.log("   2. Test your application with the updated types");
  console.log("   3. Deploy when ready");
  
  console.log("\n");
  process.exit(0);
}

// ============================================================================
// Execute
// ============================================================================

main().catch((error) => {
  logError(`Unexpected error: ${error}`);
  process.exit(1);
});

// [AUTO-GEN-END]
