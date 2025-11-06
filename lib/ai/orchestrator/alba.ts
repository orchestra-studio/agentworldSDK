import { memoryAccess } from "../tools/memory-access";
import { leadResearch } from "../tools/lead-research";
import { crmSync } from "../tools/crm-sync";
import { browserOutreach } from "../tools/browser-outreach";
import { memoryClient } from "../memory/supabase";
import type { CoreTool } from "ai";

export const albaTools = {
  memoryAccess,
  leadResearch,
  crmSync,
  browserOutreach,
} as const;

export type AlbaToolName = keyof typeof albaTools;

export interface AlbaContext {
  userId?: string;
  organizationId?: string;
  clientId?: string;
  projectId?: string;
}

export class AlbaOrchestrator {
  private context: AlbaContext;

  constructor(context: AlbaContext = {}) {
    this.context = context;
  }

  async retrieveMemory(query: string): Promise<string> {
    try {
      const results = await memoryClient.search(query, 5);
      if (results.length === 0) {
        return "";
      }
      return results
        .map((r) => r.content)
        .join("\n\n---\n\n");
    } catch {
      return "";
    }
  }

  getTools(): Record<string, CoreTool> {
    return albaTools as Record<string, CoreTool>;
  }

  async executeWorkflow(
    workflowName: string,
    input: Record<string, unknown>
  ): Promise<unknown> {
    if (workflowName === "lead_daily") {
      const researchResult = await leadResearch.execute({
        query: input.query as string,
        clientId: this.context.clientId,
        maxResults: input.maxResults as number || 20,
      });

      if ("error" in researchResult) {
        return researchResult;
      }

      if ("leadIds" in researchResult && researchResult.leadIds) {
        const syncResult = await crmSync.execute({
          leadIds: researchResult.leadIds,
          autoEnrich: true,
        });

        return {
          research: researchResult,
          sync: syncResult,
        };
      }

      return researchResult;
    }

    throw new Error(`Unknown workflow: ${workflowName}`);
  }
}

