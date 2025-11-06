import "server-only";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3001";
const MCP_API_KEY = process.env.MCP_API_KEY;

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface MCPToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export class MCPClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = MCP_SERVER_URL;
    this.apiKey = MCP_API_KEY;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `MCP API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  async listTools(): Promise<MCPTool[]> {
    try {
      const response = await this.request<{ tools: MCPTool[] }>("/tools", {
        method: "GET",
      });
      return response.tools || [];
    } catch {
      return [];
    }
  }

  async callTool(toolCall: MCPToolCall): Promise<unknown> {
    const response = await this.request("/tools/call", {
      method: "POST",
      body: JSON.stringify(toolCall),
    });
    return response;
  }

  async callSlackAction(action: string, params: Record<string, unknown>) {
    return this.callTool({
      name: `slack_${action}`,
      arguments: params,
    });
  }

  async callNotionAction(action: string, params: Record<string, unknown>) {
    return this.callTool({
      name: `notion_${action}`,
      arguments: params,
    });
  }

  async callGmailAction(action: string, params: Record<string, unknown>) {
    return this.callTool({
      name: `gmail_${action}`,
      arguments: params,
    });
  }

  async callDriveAction(action: string, params: Record<string, unknown>) {
    return this.callTool({
      name: `drive_${action}`,
      arguments: params,
    });
  }

  async callSheetsAction(action: string, params: Record<string, unknown>) {
    return this.callTool({
      name: `sheets_${action}`,
      arguments: params,
    });
  }

  async callApifyAction(action: string, params: Record<string, unknown>) {
    return this.callTool({
      name: `apify_${action}`,
      arguments: params,
    });
  }

  async callExaAction(action: string, params: Record<string, unknown>) {
    return this.callTool({
      name: `exa_${action}`,
      arguments: params,
    });
  }
}

export const mcp = new MCPClient();

