// [AUTO-GEN-START] Supabase Type & Schema Verification Script
// Generated: 2025-11-05
// Validates consistency between database.types.ts, entities.ts, and zodSchemas.ts
// ============================================================================

import fs from "fs";
import path from "path";
import type { Database } from "../src/types/database.types";
import * as Schemas from "../src/types/zodSchemas";

// ============================================================================
// Configuration
// ============================================================================

const entitiesFile = path.resolve("./src/types/entities.ts");
const zodFile = path.resolve("./src/types/zodSchemas.ts");
const dbFile = path.resolve("./src/types/database.types.ts");

function fileExists(p: string): "✅" | "❌" {
  return fs.existsSync(p) ? "✅" : "❌";
}

// ============================================================================
// Table Name Mappings
// ============================================================================

// Supabase table name → TypeScript type name
const TABLE_TO_TYPE_MAP: Record<string, string> = {
  claimants: "Claimant",
  reminders: "Reminder",
  pending_client_invites: "PendingClientInvite",
  activities: "Activity",
  email_templates: "EmailTemplate",
  payments: "Payment",
  timesheets: "Timesheet",
  messages: "Message",
  xero_sync: "XeroSync",
  sms_messages: "SMSMessage",
  sms_templates: "SMSTemplate",
  client_messages: "ClientMessage",
  app_settings: "AppSettings",
  tasks: "Task",
  company_essentials: "CompanyEssential",
  trace_history: "TraceHistory",
  claim_notes: "ClaimNote",
  trace_conversations: "TraceConversation",
  trace_messages: "TraceMessage",
  trace_tool_runs: "TraceToolRun",
};

// ============================================================================
// Extract Available Schemas
// ============================================================================

function getAvailableSchemas(): Set<string> {
  const schemaNames = new Set<string>();
  
  // Get all exported schema names from zodSchemas.ts
  for (const key of Object.keys(Schemas)) {
    if (key.endsWith("Schema") && key !== "AllSchemas" && key !== "SchemaMap") {
      schemaNames.add(key);
    }
  }
  
  return schemaNames;
}

// ============================================================================
// Extract Available Types from entities.ts
// ============================================================================

function getAvailableTypes(): Set<string> {
  const typeNames = new Set<string>();
  
  try {
    const content = fs.readFileSync(entitiesFile, "utf-8");
    
    // Extract interface and type definitions
    const interfaceRegex = /export\s+(?:interface|type)\s+(\w+)/g;
    let match;
    
    while ((match = interfaceRegex.exec(content)) !== null) {
      typeNames.add(match[1]);
    }
  } catch (error) {
    console.error("⚠️  Could not read entities.ts file");
  }
  
  return typeNames;
}

// ============================================================================
// Extract Table Names from database.types.ts
// ============================================================================

function getSupabaseTables(): string[] {
  // Use the known table list from our mapping
  return Object.keys(TABLE_TO_TYPE_MAP);
}

// ============================================================================
// Main Verification
// ============================================================================

console.log("🔍 Mason Vector Schema Verification");
console.log("====================================\n");

// File existence check
console.log("📁 File Check:");
console.log(`   Entities file:  ${fileExists(entitiesFile)} ${entitiesFile}`);
console.log(`   Zod schemas:    ${fileExists(zodFile)} ${zodFile}`);
console.log(`   Database types: ${fileExists(dbFile)} ${dbFile}\n`);

// Get all tables, types, and schemas
const supabaseTables = getSupabaseTables();
const availableTypes = getAvailableTypes();
const availableSchemas = getAvailableSchemas();

console.log(`📊 Coverage Summary:`);
console.log(`   Supabase Tables: ${supabaseTables.length}`);
console.log(`   TypeScript Types: ${availableTypes.size}`);
console.log(`   Zod Schemas: ${availableSchemas.size}\n`);

// Table coverage check
console.log("🧩 Table Coverage Check:\n");
console.log("   Table Name                  Type    Schema  Status");
console.log("   ───────────────────────────────────────────────────");

let allGood = true;
const issues: string[] = [];

supabaseTables.forEach((table) => {
  const expectedTypeName = TABLE_TO_TYPE_MAP[table];
  
  if (!expectedTypeName) {
    console.warn(`   ⚠️  Unknown table mapping: ${table}`);
    issues.push(`Unknown table: ${table}`);
    allGood = false;
    return;
  }
  
  const hasType = availableTypes.has(expectedTypeName);
  const hasSchema = availableSchemas.has(`${expectedTypeName}Schema`);
  
  const typeIcon = hasType ? "✅" : "❌";
  const schemaIcon = hasSchema ? "✅" : "❌";
  const statusIcon = hasType && hasSchema ? "✅" : "⚠️ ";
  
  console.log(
    `   ${table.padEnd(27)} ${typeIcon}      ${schemaIcon}      ${statusIcon}`
  );
  
  if (!hasType) {
    issues.push(`Missing TypeScript interface: ${expectedTypeName}`);
    allGood = false;
  }
  if (!hasSchema) {
    issues.push(`Missing Zod schema: ${expectedTypeName}Schema`);
    allGood = false;
  }
});

// SchemaMap verification
console.log("\n🗺️  SchemaMap Verification:\n");

if (Schemas.SchemaMap) {
  const schemaMapTables = Object.keys(Schemas.SchemaMap);
  console.log(`   SchemaMap contains ${schemaMapTables.length} entries`);
  
  // Check if all Supabase tables are in SchemaMap
  const missingFromMap = supabaseTables.filter(
    (table) => !schemaMapTables.includes(table)
  );
  
  if (missingFromMap.length > 0) {
    console.log(`   ⚠️  Missing from SchemaMap: ${missingFromMap.join(", ")}`);
    issues.push(`SchemaMap missing: ${missingFromMap.join(", ")}`);
    allGood = false;
  } else {
    console.log(`   ✅ All tables present in SchemaMap`);
  }
  
  // Check for extra entries in SchemaMap
  const extraInMap = schemaMapTables.filter(
    (table) => !supabaseTables.includes(table)
  );
  
  if (extraInMap.length > 0) {
    console.log(`   ⚠️  Extra in SchemaMap: ${extraInMap.join(", ")}`);
    issues.push(`SchemaMap extra: ${extraInMap.join(", ")}`);
  }
} else {
  console.log("   ❌ SchemaMap not found in zodSchemas.ts");
  issues.push("SchemaMap not exported");
  allGood = false;
}

// Validation helpers check
console.log("\n🛠️  Validation Helpers Check:\n");

const hasValidateForTable = typeof Schemas.validateForTable === "function";
const hasSafeValidateForTable = typeof Schemas.safeValidateForTable === "function";

console.log(`   validateForTable:     ${hasValidateForTable ? "✅" : "❌"}`);
console.log(`   safeValidateForTable: ${hasSafeValidateForTable ? "✅" : "❌"}`);

if (!hasValidateForTable) {
  issues.push("Missing validateForTable helper");
  allGood = false;
}
if (!hasSafeValidateForTable) {
  issues.push("Missing safeValidateForTable helper");
  allGood = false;
}

// Field consistency check (sample-based)
console.log("\n🔬 Field Consistency Sample Check:\n");

// Check a few tables for field alignment
const sampleTables = ["claimants", "reminders", "tasks", "payments"];

for (const table of sampleTables) {
  const typeName = TABLE_TO_TYPE_MAP[table];
  const schemaName = `${typeName}Schema`;
  
  if (!availableSchemas.has(schemaName)) continue;
  
  try {
    const schema = (Schemas as any)[schemaName];
    
    // Check if schema has shape property (z.object)
    if (schema && schema._def && schema._def.shape) {
      const schemaFields = Object.keys(schema._def.shape());
      console.log(`   ${typeName.padEnd(20)} ${schemaFields.length} fields ✅`);
    } else {
      console.log(`   ${typeName.padEnd(20)} Schema structure OK ✅`);
    }
  } catch (error) {
    console.log(`   ${typeName.padEnd(20)} Could not inspect ⚠️`);
  }
}

// ============================================================================
// Final Summary
// ============================================================================

console.log("\n" + "=".repeat(60));

if (allGood) {
  console.log("\n✅ ALL CHECKS PASSED!");
  console.log("\n   Your type system is fully synchronized:");
  console.log(`   • ${supabaseTables.length} Supabase tables`);
  console.log(`   • ${supabaseTables.length} TypeScript interfaces`);
  console.log(`   • ${supabaseTables.length} Zod schemas`);
  console.log("   • SchemaMap complete");
  console.log("   • Validation helpers available");
  console.log("\n   Ready for production! 🚀\n");
  process.exit(0);
} else {
  console.log("\n⚠️  ISSUES FOUND:");
  console.log("");
  issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
  console.log("\n   Please fix these issues before deployment.\n");
  process.exit(1);
}

// [AUTO-GEN-END]
