# MCP Code Execution Skill

## Overview

This skill enables efficient code execution through the Model Context Protocol (MCP), reducing token consumption by up to 98.7% compared to traditional tool-calling approaches.

## Core Principles

### 1. Progressive Disclosure
- Present MCP tools as a filesystem structure
- Load tool definitions on-demand rather than all up-front
- Navigate the tools filesystem to discover capabilities

### 2. Data Filtering
- Process large datasets in the execution environment
- Return only relevant results to avoid context bloat
- Filter, transform, and aggregate data before returning

### 3. Control Flow Optimization
- Use native code patterns (loops, conditionals) instead of chaining tool calls
- Reduce latency and improve efficiency
- Execute complex workflows in a single call

## Implementation Pattern

### File Structure
```
servers/
├── google-drive/
│   ├── getDocument.ts
│   └── index.ts
├── salesforce/
│   ├── updateRecord.ts
│   └── index.ts
├── supabase/
│   ├── query.ts
│   └── index.ts
```

### Tool Function Template
```typescript
import { callMCPTool } from "../../../client.js";

interface ToolInput {
  // Define input parameters
}

interface ToolResponse {
  // Define response structure
}

export async function toolName(input: ToolInput): Promise<ToolResponse> {
  return callMCPTool<ToolResponse>('server__tool_name', input);
}
```

## Advanced Capabilities

### Privacy Protection
- Automatically tokenize sensitive data (PII, credentials)
- Allow data to flow between services without entering model context
- Implement data masking and anonymization

### State Persistence
- Save intermediate results to files
- Enable agents to resume work across executions
- Track progress and maintain context

### Skill Development
- Persist reusable functions with documentation
- Build a toolbox of higher-level capabilities
- Create SKILL.md files for common patterns

## Usage Examples

### Example 1: Batch Data Processing
```typescript
// Process multiple records efficiently
async function processLeads(leadIds: string[]) {
  const results = [];
  for (const id of leadIds) {
    const lead = await getLeadData(id);
    const enriched = await enrichWithExternalData(lead);
    results.push(enriched);
  }
  return results;
}
```

### Example 2: Complex Workflow
```typescript
// Execute multi-step workflow in single call
async function dailyLeadResearch() {
  const leads = await searchLeads({ query: "recent prospects" });
  const filtered = leads.filter(l => l.score > 80);
  const enriched = await Promise.all(
    filtered.map(lead => enrichLeadData(lead))
  );
  await saveToDatabase(enriched);
  return { processed: enriched.length };
}
```

### Example 3: Data Aggregation
```typescript
// Aggregate large datasets before returning
async function getCRMAnalytics() {
  const allRecords = await fetchAllCRMRecords();
  return {
    total: allRecords.length,
    byStatus: groupBy(allRecords, 'status'),
    topLeads: allRecords.slice(0, 10)
  };
}
```

## Best Practices

1. **Minimize Token Usage**
   - Execute complex logic in MCP tools
   - Return only essential data to the model
   - Use aggregations and summaries

2. **Handle Errors Gracefully**
   - Implement proper error handling
   - Return meaningful error messages
   - Use try-catch blocks

3. **Optimize Performance**
   - Batch similar operations
   - Use parallel execution where possible
   - Cache frequently accessed data

4. **Maintain Security**
   - Validate all inputs
   - Sanitize sensitive data
   - Use proper authentication

## Integration with Agent World

This skill integrates seamlessly with the Alba orchestrator and specialized agents:
- **LeadResearch**: Execute search queries efficiently
- **CRMSync**: Batch process CRM updates
- **BrowserOutreach**: Orchestrate browser automation workflows
- **MemoryAccess**: Optimize memory queries and storage

## Considerations

- Requires secure sandboxing environment
- Implement resource limits for safety
- Monitor execution time and resource usage
- Balance efficiency gains against operational complexity

## References

- [Anthropic MCP Code Execution Guide](https://www.anthropic.com/engineering/code-execution-with-mcp)
- Project: `AGENT_WORLD.md` for agent architecture
- MCP Servers: Context7, Playwright, Supabase, Memory Bank
