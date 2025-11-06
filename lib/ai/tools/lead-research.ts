import { tool } from "ai";
import { z } from "zod";
import { mcp } from "../mcp/rube";
import { supabase } from "@/lib/supabase/server";
import { lead, agentRun, task } from "@/lib/db/schema";
import { generateId } from "ai";
import { createHash } from "crypto";

function generateDedupeHash(data: {
  name?: string;
  igHandle?: string;
  email?: string;
  url?: string;
}): string {
  const key = [
    data.name?.toLowerCase().trim(),
    data.igHandle?.toLowerCase().trim(),
    data.email?.toLowerCase().trim(),
    data.url?.toLowerCase().trim(),
  ]
    .filter(Boolean)
    .join("|");
  return createHash("sha256").update(key).digest("hex").substring(0, 64);
}

export const leadResearch = tool({
  description:
    "Research and find leads using Exa Search and Apify Instagram scraper. Searches for businesses looking for brands, opening salons, or changing ownership. Saves leads to Supabase and enriches them.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "Search query (e.g., 'looking for salon brand', 'opening hair salon', 'salon for sale')"
      ),
    clientId: z.string().uuid().optional().describe("Client ID if filtering by client"),
    maxResults: z.number().int().min(1).max(50).default(20),
  }),
  execute: async (input) => {
    const runId = generateId();
    const runStartTime = new Date();

    try {
      await supabase.from("AgentRun").insert({
        id: runId,
        agent: "LeadResearch",
        inputJson: input,
        status: "running",
        startedAt: runStartTime,
      });

      const results: Array<{
        name?: string;
        igHandle?: string;
        url?: string;
        location?: string;
        email?: string;
        phone?: string;
        source: string;
        metadata?: Record<string, unknown>;
      }> = [];

      const taskId1 = generateId();
      await supabase.from("Task").insert({
        id: taskId1,
        runId,
        kind: "exa_search",
        status: "running",
        inputJson: { query: input.query },
      });

      try {
        const exaResults = await mcp.callExaAction("search", {
          query: input.query,
          num_results: input.maxResults,
          use_autoprompt: true,
        });

        if (Array.isArray(exaResults)) {
          for (const result of exaResults) {
            results.push({
              name: result.title || result.text?.substring(0, 100),
              url: result.url,
              source: "exa",
              metadata: result,
            });
          }
        }

        await supabase
          .from("Task")
          .update({
            status: "completed",
            outputJson: { results: exaResults },
            finishedAt: new Date(),
          })
          .eq("id", taskId1);
      } catch (error) {
        await supabase
          .from("Task")
          .update({
            status: "failed",
            error:
              error instanceof Error ? error.message : "Unknown error",
            finishedAt: new Date(),
          })
          .eq("id", taskId1);
      }

      const taskId2 = generateId();
      await supabase.from("Task").insert({
        id: taskId2,
        runId,
        kind: "apify_instagram",
        status: "running",
        inputJson: { query: input.query },
      });

      try {
        const apifyResults = await mcp.callApifyAction("instagram_scraper", {
          query: input.query,
          max_results: input.maxResults,
        });

        if (Array.isArray(apifyResults)) {
          for (const result of apifyResults) {
            results.push({
              name: result.fullName || result.username,
              igHandle: result.username,
              url: result.url,
              location: result.location,
              source: "apify_instagram",
              metadata: result,
            });
          }
        }

        await supabase
          .from("Task")
          .update({
            status: "completed",
            outputJson: { results: apifyResults },
            finishedAt: new Date(),
          })
          .eq("id", taskId2);
      } catch (error) {
        await supabase
          .from("Task")
          .update({
            status: "failed",
            error:
              error instanceof Error ? error.message : "Unknown error",
            finishedAt: new Date(),
          })
          .eq("id", taskId2);
      }

      const savedLeads: string[] = [];

      for (const result of results) {
        const dedupeHash = generateDedupeHash(result);
        const existingLead = await supabase
          .from("Lead")
          .select("id")
          .eq("dedupeHash", dedupeHash)
          .single();

        if (existingLead.data) {
          continue;
        }

        const { data: newLead } = await supabase
          .from("Lead")
          .insert({
            clientId: input.clientId || null,
            source: result.source,
            name: result.name,
            igHandle: result.igHandle,
            url: result.url,
            location: result.location,
            email: result.email,
            phone: result.phone,
            dedupeHash,
            status: "new",
          })
          .select("id")
          .single();

        if (newLead) {
          savedLeads.push(newLead.id);
        }
      }

      await supabase
        .from("AgentRun")
        .update({
          status: "completed",
          outputJson: {
            leadsFound: results.length,
            leadsSaved: savedLeads.length,
            leadIds: savedLeads,
          },
          finishedAt: new Date(),
        })
        .eq("id", runId);

      return {
        success: true,
        leadsFound: results.length,
        leadsSaved: savedLeads.length,
        leadIds: savedLeads,
        runId,
      };
    } catch (error) {
      await supabase
        .from("AgentRun")
        .update({
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          finishedAt: new Date(),
        })
        .eq("id", runId);

      return {
        error: error instanceof Error ? error.message : "Unknown error",
        runId,
      };
    }
  },
});

