import "server-only";
import { supabase } from "@/lib/supabase/server";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ component: "Memory" });

interface MemoryResult {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
  similarity?: number;
}

export class MemoryClient {
  async add(
    content: string,
    options?: {
      entityType?: string;
      entityId?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("Memory")
        .insert({
          content,
          entityType: options?.entityType,
          entityId: options?.entityId,
          metadata: options?.metadata,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      if (options?.entityType && options?.entityId && data) {
        await supabase.from("MemoryLink").insert({
          entityType: options.entityType,
          entityId: options.entityId,
          memoryId: data.id,
        });
      }

      logger.info("Memory added", { memoryId: data.id });
      return data.id;
    } catch (error) {
      logger.error("Failed to add memory", error);
      throw error;
    }
  }

  async search(
    query: string,
    limit = 10,
    options?: {
      entityType?: string;
      entityId?: string;
    }
  ): Promise<MemoryResult[]> {
    try {
      let queryBuilder = supabase.from("Memory").select("*");

      if (options?.entityType) {
        queryBuilder = queryBuilder.eq("entityType", options.entityType);
      }

      if (options?.entityId) {
        queryBuilder = queryBuilder.eq("entityId", options.entityId);
      }

      const { data, error } = await queryBuilder
        .order("createdAt", { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      const results: MemoryResult[] = (data || []).map((item) => ({
        id: item.id,
        content: item.content,
        metadata: item.metadata as Record<string, unknown> | undefined,
      }));

      logger.info("Memory search completed", {
        query,
        resultsCount: results.length,
      });

      return results;
    } catch (error) {
      logger.error("Failed to search memory", error);
      return [];
    }
  }

  async getByEntity(
    entityType: string,
    entityId: string
  ): Promise<MemoryResult[]> {
    try {
      const { data: links, error: linksError } = await supabase
        .from("MemoryLink")
        .select("memoryId")
        .eq("entityType", entityType)
        .eq("entityId", entityId);

      if (linksError || !links || links.length === 0) {
        return [];
      }

      const memoryIds = links.map((link) => link.memoryId);

      const { data: memories, error: memoriesError } = await supabase
        .from("Memory")
        .select("*")
        .in("id", memoryIds)
        .order("createdAt", { ascending: false });

      if (memoriesError) {
        throw memoriesError;
      }

      return (memories || []).map((item) => ({
        id: item.id,
        content: item.content,
        metadata: item.metadata as Record<string, unknown> | undefined,
      }));
    } catch (error) {
      logger.error("Failed to get memory by entity", error);
      return [];
    }
  }

  async summarize(contexts: string[]): Promise<string> {
    if (contexts.length === 0) {
      return "";
    }

    if (contexts.length === 1) {
      return contexts[0];
    }

    const combined = contexts.join("\n\n---\n\n");
    if (combined.length < 1000) {
      return combined;
    }

    return `${contexts[0]}\n\n... (${contexts.length - 1} more contexts)`;
  }
}

export const memoryClient = new MemoryClient();

