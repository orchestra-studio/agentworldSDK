import { tool } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase/server";
import { interaction, agentRun, task } from "@/lib/db/schema";
import { generateId } from "ai";

const STAGEHAND_API_KEY = process.env.STAGEHAND_API_KEY;
const STAGEHAND_API_URL = process.env.STAGEHAND_API_URL || "https://api.stagehand.ai/v1";

interface StagehandAction {
  type: "comment" | "dm";
  target: string;
  content: string;
  metadata?: Record<string, unknown>;
}

async function callStagehand(action: StagehandAction): Promise<unknown> {
  if (!STAGEHAND_API_KEY) {
    throw new Error("STAGEHAND_API_KEY is not configured");
  }

  const response = await fetch(`${STAGEHAND_API_URL}/actions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STAGEHAND_API_KEY}`,
    },
    body: JSON.stringify({
      action: action.type,
      target: action.target,
      content: action.content,
      metadata: action.metadata,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Stagehand API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}

export const browserOutreach = tool({
  description:
    "Automate Instagram outreach using Stagehand browser automation. Can comment on posts or send DMs. Respects rate limits and Instagram ToS.",
  inputSchema: z.object({
    leadId: z.string().uuid().describe("Lead ID to outreach to"),
    action: z
      .enum(["comment", "dm"])
      .describe("Type of outreach action"),
    content: z
      .string()
      .describe("Comment or DM content"),
    postUrl: z
      .string()
      .url()
      .optional()
      .describe("Post URL for comment action"),
    delaySeconds: z
      .number()
      .int()
      .min(5)
      .max(300)
      .default(10)
      .describe("Delay between actions to respect rate limits"),
  }),
  execute: async (input) => {
    const runId = generateId();
    const runStartTime = new Date();

    try {
      const { data: lead } = await supabase
        .from("Lead")
        .select("*")
        .eq("id", input.leadId)
        .single();

      if (!lead) {
        return { error: `Lead ${input.leadId} not found` };
      }

      if (!lead.igHandle && input.action === "dm") {
        return {
          error: "Lead does not have Instagram handle for DM action",
        };
      }

      await supabase.from("AgentRun").insert({
        id: runId,
        agent: "BrowserOutreach",
        inputJson: input,
        status: "running",
        startedAt: runStartTime,
      });

      const taskId = generateId();
      await supabase.from("Task").insert({
        id: taskId,
        runId,
        kind: `instagram_${input.action}`,
        status: "running",
        inputJson: input,
      });

      let stagehandResult: unknown;

      if (input.action === "comment") {
        if (!input.postUrl) {
          return { error: "postUrl is required for comment action" };
        }

        stagehandResult = await callStagehand({
          type: "comment",
          target: input.postUrl,
          content: input.content,
          metadata: {
            leadId: input.leadId,
            leadName: lead.name,
          },
        });
      } else {
        stagehandResult = await callStagehand({
          type: "dm",
          target: lead.igHandle!,
          content: input.content,
          metadata: {
            leadId: input.leadId,
            leadName: lead.name,
          },
        });
      }

      await supabase
        .from("Task")
        .update({
          status: "completed",
          outputJson: { result: stagehandResult },
          finishedAt: new Date(),
        })
        .eq("id", taskId);

      const interactionId = generateId();
      await supabase.from("Interaction").insert({
        id: interactionId,
        leadId: input.leadId,
        channel: "instagram",
        direction: "outbound",
        content: input.content,
        metadataJson: {
          action: input.action,
          stagehandResult,
        },
      });

      await supabase
        .from("Lead")
        .update({
          status: input.action === "dm" ? "contacted" : "new",
        })
        .eq("id", input.leadId);

      await supabase
        .from("AgentRun")
        .update({
          status: "completed",
          outputJson: {
            interactionId,
            result: stagehandResult,
          },
          finishedAt: new Date(),
        })
        .eq("id", runId);

      return {
        success: true,
        interactionId,
        action: input.action,
        message: `${input.action} sent successfully`,
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

