"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Send, 
  Bot, 
  User, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  RotateCcw
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface AgentConfig {
  name: string;
  description: string;
  placeholder: string;
  examples: string[];
}

const agentConfigs: Record<string, AgentConfig> = {
  "tracer": {
    name: "Tracer AI",
    description: "Advanced claimant data tracking and verification system",
    placeholder: "Ask about claimant data, tracking status, or verification processes...",
    examples: [
      "Show me the latest claimant verification reports",
      "Track claim ID #12345 status",
      "Generate audit trail for last week's claims"
    ]
  },
  "database": {
    name: "Database AI", 
    description: "Intelligent database management and query optimization",
    placeholder: "Ask about database queries, optimization, or data analysis...",
    examples: [
      "Optimize the claimants table performance",
      "Show me database health metrics",
      "Analyze query patterns from the last 24 hours"
    ]
  },
  "task-manager": {
    name: "Task Manager AI",
    description: "Workflow orchestration and task automation platform",
    placeholder: "Ask about task management, workflows, or automation...",
    examples: [
      "Show me all pending tasks",
      "Create a workflow for claim processing",
      "Schedule weekly report generation"
    ]
  },
  "sentinel": {
    name: "Sentinel AI",
    description: "Advanced security monitoring and threat detection system",
    placeholder: "Ask about security monitoring, threats, or compliance...",
    examples: [
      "Show me security alerts from today",
      "Run a system vulnerability scan",
      "Check compliance status for data handling"
    ]
  },
  "admin": {
    name: "Admin AI",
    description: "Administrative operations and system management assistant",
    placeholder: "Ask about system administration, user management, or configuration...",
    examples: [
      "Show me system resource usage",
      "List all active user sessions",
      "Update system configuration settings"
    ]
  },
  "system-test": {
    name: "System Test AI",
    description: "Automated system testing and health validation services",
    placeholder: "Ask about system tests, health checks, or diagnostics...",
    examples: [
      "Run a full system health check",
      "Test all API endpoints",
      "Generate system performance report"
    ]
  }
};

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const agentId = params.agent as string;
  const agentConfig = agentConfigs[agentId];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Add welcome message when component mounts
    if (agentConfig && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'agent',
        content: `Hello! I'm ${agentConfig.name}. ${agentConfig.description}

How can I help you today? You can ask me about:
${agentConfig.examples.map(example => `• ${example}`).join('\n')}`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [agentConfig, messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/agent/${agentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          user_id: 'demo-user', // In production, use actual user ID
          timestamp: new Date().toISOString()
        }),
      });

      let agentResponse: string;
      
      if (response.ok) {
        agentResponse = await response.text();
        
        // Handle empty responses
        if (!agentResponse.trim()) {
          agentResponse = `I received your request but didn't get a response from the ${agentConfig.name} service. The agent might be initializing or temporarily unavailable.`;
        }
      } else {
        // Handle different error status codes
        if (response.status === 404) {
          agentResponse = `The ${agentConfig.name} service is not currently available. Please check that the agent is running and try again.`;
        } else if (response.status === 500) {
          agentResponse = `There was an internal error communicating with ${agentConfig.name}. Please try again in a moment.`;
        } else {
          agentResponse = `Error ${response.status}: Unable to communicate with ${agentConfig.name}. Please try again later.`;
        }
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: agentResponse,
        timestamp: new Date(),
        status: 'sent'
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: `Connection error: Unable to reach ${agentConfig.name}. Please check your network connection and ensure the agent services are running.`,
        timestamp: new Date(),
        status: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    setMessages([]);
    // Re-add welcome message
    if (agentConfig) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'agent',
        content: `Hello! I'm ${agentConfig.name}. ${agentConfig.description}

How can I help you today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  if (!agentConfig) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">Agent Not Found</h2>
          <p className="text-gray-600 mt-2">The requested agent "{agentId}" is not available.</p>
          <button
            onClick={() => router.push('/agents')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Return to Agents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border-b p-4">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/agents')}
            className="p-2 hover:bg-gray-100 rounded-lg mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Bot className="h-8 w-8 text-indigo-600 mr-3" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{agentConfig.name}</h1>
            <p className="text-sm text-gray-600">{agentConfig.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-green-500 rounded-full mr-2" />
            <span className="text-sm text-gray-600">Online</span>
          </div>
          <button
            onClick={clearChat}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Clear chat"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start">
                {message.type === 'agent' && (
                  <Bot className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-indigo-600" />
                )}
                <div className="flex-1">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {message.content}
                  </pre>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-xs opacity-75">
                      <Clock className="h-3 w-3 mr-1" />
                      {message.timestamp.toLocaleTimeString()}
                      {message.status === 'sending' && (
                        <Loader2 className="h-3 w-3 ml-2 animate-spin" />
                      )}
                      {message.status === 'sent' && (
                        <CheckCircle className="h-3 w-3 ml-2" />
                      )}
                      {message.status === 'error' && (
                        <AlertCircle className="h-3 w-3 ml-2 text-red-500" />
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black hover:bg-opacity-10 rounded"
                      title="Copy message"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                {message.type === 'user' && (
                  <User className="h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-indigo-600" />
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">{agentConfig.name} is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={agentConfig.placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}