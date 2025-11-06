# Claude Code Skills

This directory contains specialized skills that extend Claude's capabilities for the Agent World project.

## Available Skills

### 1. MCP Code Execution (`mcp-code-execution.md`)

**Purpose**: Optimize code execution through Model Context Protocol (MCP) for efficient agent operations.

**Key Features**:
- Reduce token consumption by up to 98.7%
- Progressive disclosure of tools
- Data filtering and aggregation
- State persistence across executions
- Privacy protection for sensitive data

**Use Cases**:
- Batch processing of CRM data
- Complex multi-step workflows
- Large dataset aggregation
- Reusable function development

**Integration**: Works with Alba orchestrator and all specialized agents (LeadResearch, CRMSync, BrowserOutreach, MemoryAccess)

## How to Use Skills

Skills are automatically available to Claude Code when working in this project. To invoke a skill:

1. Reference the skill by name in your conversation
2. Claude will apply the patterns and best practices defined in the skill
3. Skills provide context-aware capabilities without requiring explicit invocation

## Adding New Skills

To create a new skill:

1. Create a new `.md` file in this directory
2. Follow the pattern of existing skills:
   - Overview section
   - Core principles
   - Implementation patterns
   - Usage examples
   - Best practices
3. Update this README with the new skill

## Skill Development Best Practices

- **Focused Scope**: Each skill should address a specific capability or pattern
- **Clear Examples**: Provide concrete code examples
- **Documentation**: Include references and integration notes
- **Maintainable**: Keep skills updated with project evolution

## MCP Servers Configured

The following MCP servers are available for use with these skills:

- **Context7** - Context management with Upstash
- **Playwright** - Automated browser testing
- **Supabase** - Database and backend operations
- **Memory Bank** - Persistent memory across sessions

## Project Context

This skills directory is part of the Agent World project, which uses:
- Vercel AI SDK for agent orchestration
- Next.js 15 for the application framework
- Supabase for database and memory
- MCP Rube for unified tool integration

See `AGENT_WORLD.md` in the project root for complete architecture details.

## References

- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Anthropic MCP Guide](https://www.anthropic.com/engineering/code-execution-with-mcp)
