# 🤖 Mason Vector AI Agent Access System

A unified, secure interface for accessing Mason Vector's AI agents through the main application. Each agent provides specialized capabilities through a chat-based interface with proper authentication and authorization.

## 🎯 System Overview

The AI Agent Access System provides:
- **Unified Interface**: All 6 AI agents accessible from a single dashboard
- **Secure Authentication**: User login required for all agent access
- **Plain-Text Communication**: Natural language queries with text responses
- **Real-Time Chat**: Interactive chat interface for each agent
- **Secure API Proxy**: Backend keys hidden from frontend clients
- **Fault Tolerance**: Multiple endpoint fallback and error handling

## 🤖 Available AI Agents

### 1. **Tracer AI**
- **Purpose**: Advanced claimant data tracking and verification
- **Capabilities**: Data tracking, verification, report generation, audit trails
- **Example Queries**:
  - "Show me the latest claimant verification reports"
  - "Track claim ID #12345 status"
  - "Generate audit trail for last week's claims"

### 2. **Database AI**  
- **Purpose**: Intelligent database management and query optimization
- **Capabilities**: Query optimization, data analysis, schema management, performance tuning
- **Example Queries**:
  - "Optimize the claimants table performance"
  - "Show me database health metrics"
  - "Analyze query patterns from the last 24 hours"

### 3. **Task Manager AI**
- **Purpose**: Workflow orchestration and task automation
- **Capabilities**: Task orchestration, workflow automation, process management, scheduling
- **Example Queries**:
  - "Show me all pending tasks"
  - "Create a workflow for claim processing"
  - "Schedule weekly report generation"

### 4. **Sentinel AI**
- **Purpose**: Advanced security monitoring and threat detection
- **Capabilities**: Security monitoring, threat detection, risk assessment, compliance
- **Example Queries**:
  - "Show me security alerts from today"
  - "Run a system vulnerability scan"
  - "Check compliance status for data handling"

### 5. **Admin AI**
- **Purpose**: Administrative operations and system management
- **Capabilities**: System administration, user management, configuration, monitoring
- **Example Queries**:
  - "Show me system resource usage"
  - "List all active user sessions"
  - "Update system configuration settings"

### 6. **System Test AI**
- **Purpose**: Automated system testing and health validation
- **Capabilities**: System testing, health checks, performance monitoring, diagnostics
- **Example Queries**:
  - "Run a full system health check"
  - "Test all API endpoints"
  - "Generate system performance report"

## 🏗️ Architecture

### Frontend Structure
```
src/app/agents/
├── layout.tsx              # Auth protection & shared layout
├── page.tsx                # Agent dashboard with status overview
└── [agent]/
    └── page.tsx            # Dynamic chat interface for each agent

src/app/api/agent/[agent]/
└── route.ts                # Secure API proxy with fallback URLs
```

### Component Hierarchy
```
AgentsLayout (Auth Protection)
├── AgentsPage (Dashboard)
│   ├── Agent Status Cards
│   ├── Health Metrics
│   └── Quick Access Links
└── AgentChatPage (Individual Chat)
    ├── Chat Messages
    ├── Input Interface
    └── Agent Status Display
```

## 🔐 Security Features

### Authentication & Authorization
- **Login Required**: All `/agents/*` routes protected by authentication
- **Session Validation**: Server-side session checking on each request  
- **Role-Based Access**: Optional role restrictions for sensitive agents (Admin AI)
- **Audit Logging**: User access and query logging for compliance

### API Security
- **Hidden API Keys**: Agent credentials stored server-side only
- **Request Validation**: Input sanitization and validation
- **Rate Limiting**: Protection against excessive requests
- **Error Handling**: Secure error messages without exposing internals

### Data Protection
- **No Client Secrets**: API keys never exposed to frontend
- **Encrypted Communication**: HTTPS for all agent communications
- **Request Logging**: Audit trail of all agent interactions
- **Timeout Controls**: Protection against hanging requests

## ⚙️ Configuration

### Environment Variables (.env.local)

```bash
# Agent Service Configuration
AGENT_BASE_URL=http://localhost:8000/agent

# Individual Agent API Keys  
AGENT_TRACER_KEY=your-tracer-secret-key
AGENT_DATABASE_KEY=your-database-secret-key
AGENT_TASK_MANAGER_KEY=your-task-secret-key
AGENT_SENTINEL_KEY=your-sentinel-secret-key
AGENT_ADMIN_KEY=your-admin-secret-key
AGENT_SYSTEM_TEST_KEY=your-system-test-secret-key

# Timeout and Fallback Settings
AGENT_TIMEOUT=15000
```

### Agent Service Endpoints

The system expects agents to be available at:
- `POST /agent/{agent-name}/chat`
- Request format: `{"query": "user question", "user_id": "user123"}`
- Response format: Plain text or JSON with text response

### Fallback Configuration

Multiple endpoint URLs are attempted in order:
1. `AGENT_BASE_URL` (primary)
2. `http://localhost:3001/api/agent` 
3. `http://localhost:4000/agent`
4. `http://127.0.0.1:8000/agent`

## 🚀 Usage

### Accessing AI Agents

1. **Navigate to AI Agents**: Use sidebar navigation "🤖 AI Agents"
2. **View Dashboard**: See all agents, their status, and capabilities  
3. **Select Agent**: Click "Open Chat Interface" for online agents
4. **Start Chatting**: Type natural language queries and receive responses

### Example Interaction Flow

```
User: "Show me the status of claim #ABC123"
Tracer AI: "Claim #ABC123 Status Report:
- Current Status: Under Review
- Assigned Processor: Sarah Johnson  
- Last Updated: 2025-11-06 14:30
- Next Action: Document verification pending
- Estimated Completion: 2025-11-08"
```

### Chat Interface Features

- **Real-time messaging** with typing indicators
- **Message history** preserved during session
- **Copy functionality** for agent responses  
- **Error handling** with helpful retry messages
- **Status indicators** showing agent availability
- **Welcome messages** with capability examples

## 🛠️ Development

### Adding New Agents

1. **Update Agent Configuration** (`route.ts`):
```typescript
const AGENT_ENDPOINTS = {
  // ... existing agents
  'new-agent': 'new-agent'
};

const AGENT_DESCRIPTIONS = {
  // ... existing descriptions  
  'new-agent': 'New Agent - Description of capabilities'
};
```

2. **Add to Navigation** (`SystemSidebar.tsx`):
```typescript
{ name: "New Agent", icon: NewIcon, href: "/agents/new-agent" }
```

3. **Configure Environment**:
```bash
AGENT_NEW_AGENT_KEY=new-agent-secret-key
```

### Custom Agent Interfaces

For agents requiring specialized interfaces, create custom components:

```typescript
// src/app/agents/[agent]/custom-interface.tsx
export function CustomAgentInterface({ agentId }: { agentId: string }) {
  // Custom UI for specific agent needs
}
```

### Error Handling

The system provides multiple error handling levels:

1. **Network Errors**: Automatic fallback to alternative URLs
2. **Agent Unavailable**: Helpful error messages with troubleshooting
3. **Invalid Responses**: Graceful handling of empty or malformed responses
4. **Authentication Errors**: Redirect to login with proper error context

## 📊 Monitoring & Analytics

### Built-in Monitoring

- **Agent Status Tracking**: Real-time availability monitoring
- **Response Time Metrics**: Performance measurement per agent
- **Error Rate Monitoring**: Failed request tracking  
- **User Access Logging**: Audit trail of agent usage

### Health Dashboard

The main agents page provides:
- **Overall System Health**: Percentage of agents online
- **Individual Agent Status**: Online/Offline/Maintenance indicators
- **Performance Metrics**: Average response times
- **Recent Activity**: Last active timestamps

## 🔧 Troubleshooting

### Common Issues

**Agent shows as offline:**
- Check agent service is running on expected port
- Verify `AGENT_BASE_URL` configuration
- Test direct API endpoint access
- Check network connectivity

**Authentication errors:**
- Verify user session is valid
- Check authentication middleware configuration
- Ensure proper redirect URLs

**API key errors:**
- Verify environment variables are set
- Check agent service expects the correct auth format
- Ensure keys match between UI and agent service

### Debug Mode

Enable verbose logging by setting:
```bash
DEBUG_AGENTS=true
```

This will log:
- API request/response details
- Authentication attempts
- Fallback URL attempts
- Error stack traces

## 🔄 Integration

### CI/CD Pipeline

```yaml
# .github/workflows/test-agents.yml
- name: Test Agent Interfaces
  run: |
    npm run test:agents
    npm run test:ui:agents
    
- name: Verify Agent Configuration  
  run: |
    npm run verify:agent-config
```

### Docker Integration

```dockerfile
# Agent service health checks
HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:3000/api/agent/tracer || exit 1
```

### Monitoring Integration

```bash
# Add to monitoring dashboards
curl -X POST "monitoring.example.com/api/metrics" \
  -d '{"metric": "agent.response_time", "value": 150, "agent": "tracer"}'
```

## 📚 API Reference

### Agent Chat API

**Endpoint**: `POST /api/agent/[agent]`

**Request**:
```json
{
  "query": "What is the status of claim #123?",
  "user_id": "optional-user-identifier",
  "timestamp": "2025-11-06T14:30:00Z"
}
```

**Response**: Plain text response from the agent

**Status Codes**:
- `200`: Success
- `400`: Invalid request format  
- `404`: Agent not found
- `503`: Agent unavailable

### Agent Info API

**Endpoint**: `GET /api/agent/[agent]`

**Response**:
```json
{
  "agent": "tracer",
  "name": "Tracer AI - Advanced claimant data tracking",
  "status": "available",
  "methods": ["POST"]
}
```

---

## 🎯 Next Steps

1. **Deploy Agent Services**: Ensure all 6 agents are running and accessible
2. **Configure Authentication**: Set up proper user authentication system  
3. **Set API Keys**: Generate and configure secure agent API keys
4. **Test Integration**: Verify all agents respond correctly through the interface
5. **Monitor Performance**: Set up monitoring and alerting for agent health
6. **User Training**: Create user guides for effective agent interaction

**Mason Vector AI Integration Team**  
*Unifying AI capabilities through secure, user-friendly interfaces*