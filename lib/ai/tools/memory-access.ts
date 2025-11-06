import { tool } from "ai";
import { z } from "zod";
import { memoryClient } from "../memory/supabase";

export const memoryAccess = tool({
  description:
    "Search, attach, or summarize memory stored in Supabase. Use this to retrieve context about entities, leads, clients, or projects.",
  inputSchema: z.object({
    action: z
      .enum(["search", "attach", "summarize"])
      .describe("Action to perform on memory"),
    query: z
      .string()
      .describe("Search query or content to attach/summarize")
      .optional(),
    entityType: z
      .string()
      .describe("Entity type (e.g., 'lead', 'client', 'project')")
      .optional(),
    entityId: z
      .string()
      .uuid()
      .describe("Entity UUID in Supabase")
      .optional(),
    context: z
      .array(z.string())
      .describe("Array of context strings to summarize")
      .optional(),
  }),
  execute: async (input) => {
    try {
      if (input.action === "search") {
        if (!input.query) {
          return { error: "Query is required for search action" };
        }
        const results = await memoryClient.search(input.query, 10, {
          entityType: input.entityType,
          entityId: input.entityId,
        });
        return {
          success: true,
          results: results.map((r) => ({
            content: r.content,
            metadata: r.metadata,
          })),
        };
      }

      if (input.action === "attach") {
        if (!input.entityType || !input.entityId || !input.query) {
          return {
            error:
              "entityType, entityId, and query are required for attach action",
          };
        }
        const memoryId = await memoryClient.add(input.query, {
          entityType: input.entityType,
          entityId: input.entityId,
        });

        return {
          success: true,
          memoryId,
          message: `Memory attached to ${input.entityType} ${input.entityId}`,
        };
      }

      if (input.action === "summarize") {
        if (!input.context || input.context.length === 0) {
          return {
            error: "Context array is required for summarize action",
          };
        }
        const summary = await memoryClient.summarize(input.context);
        return {
          success: true,
          summary,
        };
      }

      return { error: "Invalid action" };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});

