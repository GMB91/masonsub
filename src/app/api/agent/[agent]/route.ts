import { NextRequest, NextResponse } from 'next/server';

// Agent endpoint mappings
const AGENT_ENDPOINTS: Record<string, string> = {
  'tracer': 'tracer',
  'database': 'database', 
  'task-manager': 'task-manager',
  'sentinel': 'sentinel',
  'admin': 'admin',
  'system-test': 'system-test'
};

// Agent descriptions for fallback responses
const AGENT_DESCRIPTIONS: Record<string, string> = {
  'tracer': 'Tracer AI - Advanced claimant data tracking and verification system',
  'database': 'Database AI - Intelligent database management and query optimization',
  'task-manager': 'Task Manager AI - Workflow orchestration and task automation platform',
  'sentinel': 'Sentinel AI - Advanced security monitoring and threat detection system',
  'admin': 'Admin AI - Administrative operations and system management assistant',
  'system-test': 'System Test AI - Automated system testing and health validation services'
};

interface AgentRequest {
  query: string;
  user_id?: string;
  timestamp?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { agent: string } }
) {
  try {
    const agentId = params.agent;
    
    // Validate agent ID
    if (!agentId || !AGENT_ENDPOINTS[agentId]) {
      return NextResponse.json(
        { error: `Invalid agent: ${agentId}` }, 
        { status: 404 }
      );
    }

    // Parse request body
    let body: AgentRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { query, user_id, timestamp } = body;

    // Validate required fields
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Get API key for the agent (if configured)
    const apiKeyEnvName = `AGENT_${agentId.toUpperCase().replace('-', '_')}_KEY`;
    const apiKey = process.env[apiKeyEnvName];
    
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mason-Vector-UI/1.0'
    };

    if (apiKey) {
      headers['x-api-key'] = apiKey;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Prepare request payload
    const payload = {
      query: query.trim(),
      user_id: user_id || 'anonymous',
      timestamp: timestamp || new Date().toISOString(),
      source: 'mason-vector-ui'
    };

    console.log(`Agent API call: ${agentId} - ${query.slice(0, 50)}...`);

    // Development mode: Return mock response instead of pinging external services
    if (process.env.NODE_ENV === 'development') {
      console.log(`Mock agent response for ${agentId} in development mode`);
      return NextResponse.json({
        response: `Mock response from ${agentId} agent: This is a development placeholder. The agent system would process: "${query.slice(0, 100)}..."`,
        metadata: {
          agent: agentId,
          timestamp: new Date().toISOString(),
          mode: 'development'
        }
      });
    }

    // Base URLs to try (in order of preference) - only in production
    const baseUrls = [
      process.env.AGENT_BASE_URL || 'http://localhost:8000/agent'
    ];

    let lastError: Error | null = null;
    
    // Try each base URL
    for (const baseUrl of baseUrls) {
      try {
        const agentUrl = `${baseUrl}/${AGENT_ENDPOINTS[agentId]}/chat`;
        
        console.log(`Attempting to connect to: ${agentUrl}`);
        
        const response = await fetch(agentUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          
          let responseText: string;
          
          if (contentType.includes('application/json')) {
            const jsonResponse = await response.json();
            // Extract text from various possible JSON response formats
            responseText = jsonResponse.response || 
                          jsonResponse.message || 
                          jsonResponse.result || 
                          jsonResponse.output ||
                          JSON.stringify(jsonResponse, null, 2);
          } else {
            responseText = await response.text();
          }

          // Validate response content
          if (!responseText || responseText.trim().length === 0) {
            responseText = `${AGENT_DESCRIPTIONS[agentId]} received your request but returned an empty response. The agent may be initializing or processing your query.`;
          }

          console.log(`Successful response from ${agentId}: ${responseText.slice(0, 100)}...`);

          return new Response(responseText, {
            status: 200,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          });
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to connect to ${agentId} at ${baseUrls[baseUrls.indexOf(baseUrl)]}: ${error}`);
        continue; // Try next URL
      }
    }

    // All URLs failed
    console.error(`All connection attempts failed for ${agentId}:`, lastError);
    
    // Return a helpful fallback response
    const fallbackResponse = `${AGENT_DESCRIPTIONS[agentId]} is currently unavailable.

Your query: "${query}"

This could be due to:
• The agent service is not running
• Network connectivity issues  
• The agent is starting up or under maintenance

Please try again in a moment, or contact the system administrator if the problem persists.

Error details: ${lastError?.message || 'Connection failed'}`;

    return new Response(fallbackResponse, {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('Agent API proxy error:', error);
    
    const errorResponse = `Internal server error occurred while processing your request.

Please try again in a moment. If the problem persists, contact the system administrator.

Error: ${error instanceof Error ? error.message : 'Unknown error'}`;

    return new Response(errorResponse, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
}

// Handle GET requests with agent info
export async function GET(
  request: NextRequest,
  { params }: { params: { agent: string } }
) {
  const agentId = params.agent;
  
  if (!agentId || !AGENT_ENDPOINTS[agentId]) {
    return NextResponse.json(
      { error: `Invalid agent: ${agentId}` }, 
      { status: 404 }
    );
  }

  return NextResponse.json({
    agent: agentId,
    name: AGENT_DESCRIPTIONS[agentId],
    endpoint: AGENT_ENDPOINTS[agentId],
    status: 'available',
    methods: ['POST'],
    description: 'Send POST requests with {"query": "your question"} to chat with this agent'
  });
}