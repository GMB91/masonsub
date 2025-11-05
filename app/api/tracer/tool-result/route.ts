import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabaseClient";

interface ToolResultRequest {
  conversationId: string;
  toolName: string;
  resultJson: any;
  toolRunId?: string;
}

// Known tool intents
const KNOWN_INTENTS = [
  "search_qld_unclaimed",
  "search_nsw_unclaimed",
  "search_vic_unclaimed",
  "search_asic_gazette",
  "call_abn_lookup",
  "verify_identity",
  "estimate_claim_value",
];

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = getSupabaseServiceClient();
  
  try {
    const body: ToolResultRequest = await req.json();
    const { conversationId, toolName, resultJson, toolRunId } = body;

    // Validate input
    if (!conversationId || !toolName || !resultJson) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate toolName is in KNOWN_INTENTS
    if (!KNOWN_INTENTS.includes(toolName)) {
      return NextResponse.json(
        { error: `Unknown tool: ${toolName}` },
        { status: 400 }
      );
    }

    // Update or create tool run record
    if (toolRunId) {
      const { error: updateError } = await supabase
        .from("trace_tool_runs")
        .update({
          result: resultJson,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", toolRunId);

      if (updateError) throw updateError;
    } else {
      await supabase.from("trace_tool_runs").insert({
        conversation_id: conversationId,
        name: toolName,
        args: {},
        result: resultJson,
        status: "completed",
        completed_at: new Date().toISOString(),
      });
    }

    // Generate follow-up message based on tool result
    const followup = generateFollowup(toolName, resultJson);

    // Persist the follow-up message
    await supabase.from("trace_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: followup,
    });

    return NextResponse.json({
      ok: true,
      followup,
    });
  } catch (error: any) {
    console.error("Tool result API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generate a follow-up message based on tool results
 */
function generateFollowup(toolName: string, result: any): string {
  const matchCount = Array.isArray(result.matches)
    ? result.matches.length
    : result.count || 0;

  switch (toolName) {
    case "search_qld_unclaimed":
      return matchCount > 0
        ? `✅ Found ${matchCount} potential matches in QLD Public Trustee database:\n\n${formatMatches(result.matches)}\n\nWould you like me to investigate any of these further?`
        : `❌ No matches found in QLD Public Trustee database. Would you like me to search other states?`;

    case "search_nsw_unclaimed":
      return matchCount > 0
        ? `✅ Found ${matchCount} potential matches in NSW Unclaimed Money database:\n\n${formatMatches(result.matches)}\n\nShall I proceed with verification?`
        : `❌ No matches found in NSW database. Let's try other sources.`;

    case "search_vic_unclaimed":
      return matchCount > 0
        ? `✅ Found ${matchCount} potential matches in VIC State Revenue database:\n\n${formatMatches(result.matches)}`
        : `❌ No matches in VIC database.`;

    case "search_asic_gazette":
      return matchCount > 0
        ? `✅ ASIC search returned ${matchCount} results:\n\n${formatMatches(result.matches)}\n\nThese are from the official ASIC Gazette.`
        : `❌ No ASIC Gazette entries found for that query.`;

    case "call_abn_lookup":
      return result.found
        ? `✅ ABN Lookup successful:\n\nBusiness: ${result.name}\nABN: ${result.abn}\nStatus: ${result.status}\n\nEntity is ${result.status === "Active" ? "active" : "inactive"}.`
        : `❌ ABN not found for that business name.`;

    case "verify_identity":
      return result.verified
        ? `✅ Identity verification successful. Confidence: ${result.confidence}%`
        : `⚠️ Identity verification failed. ${result.reason}`;

    case "estimate_claim_value":
      return `💰 Estimated claim value: $${result.amount?.toLocaleString() || "Unknown"}\n\nBased on ${result.source} records from ${result.date}.`;

    default:
      return `Tool ${toolName} completed. Result: ${JSON.stringify(result).substring(0, 200)}`;
  }
}

/**
 * Format match results for display
 */
function formatMatches(matches: any[]): string {
  if (!Array.isArray(matches) || matches.length === 0) {
    return "No details available.";
  }

  return matches
    .slice(0, 3) // Show top 3
    .map((match, i) => {
      const name = match.name || match.full_name || "Unknown";
      const amount = match.amount ? `$${match.amount.toLocaleString()}` : "Amount unknown";
      const date = match.date || match.created_at || "";
      
      return `${i + 1}. **${name}** - ${amount}${date ? ` (${date})` : ""}`;
    })
    .join("\n");
}
