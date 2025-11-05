import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabaseClient";

interface TracerRequest {
  conversationId?: string;
  message: string;
  userId?: string;
}

interface ToolCall {
  name: string;
  args: Record<string, any>;
}

interface TracerResponse {
  conversationId: string;
  messageId: string;
  content: string;
  toolCall?: ToolCall;
}

// Known tool intents for the Tracer Agent
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
    const body: TracerRequest = await req.json();
    const { conversationId, message, userId } = body;

    // Validate input
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Create or get conversation
    let convId = conversationId;
    if (!convId) {
      const { data: newConv, error: convError } = await supabase
        .from("trace_conversations")
        .insert({
          title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
          created_by: userId,
        })
        .select("id")
        .single();

      if (convError) throw convError;
      convId = newConv.id;
    }

    // Persist user message
    const { data: userMessage, error: userMsgError } = await supabase
      .from("trace_messages")
      .insert({
        conversation_id: convId,
        role: "user",
        content: message,
      })
      .select("id")
      .single();

    if (userMsgError) throw userMsgError;

    // Simulate LLM response (in production, call OpenAI, Anthropic, etc.)
    const response = await generateTracerResponse(message, convId!);

    // Persist assistant message
    const { data: assistantMessage, error: assistantMsgError } = await supabase
      .from("trace_messages")
      .insert({
        conversation_id: convId,
        role: "assistant",
        content: response.content,
      })
      .select("id")
      .single();

    if (assistantMsgError) throw assistantMsgError;

    // If there's a tool call, persist it
    if (response.toolCall) {
      await supabase.from("trace_tool_runs").insert({
        conversation_id: convId,
        name: response.toolCall.name,
        args: response.toolCall.args,
        status: "pending",
      });
    }

    return NextResponse.json({
      conversationId: convId,
      messageId: assistantMessage.id,
      content: response.content,
      toolCall: response.toolCall,
    } as TracerResponse);
  } catch (error: any) {
    console.error("Tracer API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generate Tracer Agent response
 * In production, this would call an LLM with the conversation history
 */
async function generateTracerResponse(
  message: string,
  conversationId: string
): Promise<{ content: string; toolCall?: ToolCall }> {
  const lowerMessage = message.toLowerCase();

  // Simple intent matching (replace with real LLM)
  if (
    lowerMessage.includes("search") ||
    lowerMessage.includes("find") ||
    lowerMessage.includes("look for")
  ) {
    // Determine which state to search
    let toolName = "search_qld_unclaimed";
    let state = "QLD";

    if (lowerMessage.includes("nsw") || lowerMessage.includes("new south wales")) {
      toolName = "search_nsw_unclaimed";
      state = "NSW";
    } else if (lowerMessage.includes("vic") || lowerMessage.includes("victoria")) {
      toolName = "search_vic_unclaimed";
      state = "VIC";
    } else if (lowerMessage.includes("asic") || lowerMessage.includes("company")) {
      toolName = "search_asic_gazette";
      state = "ASIC";
    }

    // Extract search terms (simple version)
    const searchTerms = message
      .replace(/search|find|look for|in|the/gi, "")
      .trim();

    return {
      content: `🔍 I'll search the ${state} database for "${searchTerms}". Let me initiate the search...`,
      toolCall: {
        name: toolName,
        args: {
          query: searchTerms,
          state: state,
        },
      },
    };
  }

  if (lowerMessage.includes("abn") || lowerMessage.includes("business")) {
    return {
      content: "🔍 I'll look up the ABN for that business...",
      toolCall: {
        name: "call_abn_lookup",
        args: {
          businessName: message.replace(/abn|lookup|find|search/gi, "").trim(),
        },
      },
    };
  }

  // Default response
  return {
    content: `I understand you're asking about: "${message}". I can help you search across QLD, NSW, VIC, and ASIC databases. What would you like me to find?`,
  };
}
