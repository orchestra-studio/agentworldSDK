import { tool } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase/server";
import { createHash } from "crypto";

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function calculateScore(lead: {
  email?: string;
  phone?: string;
  igHandle?: string;
  location?: string;
  url?: string;
}): {
  overall: number;
  engagement: number;
  fit: number;
} {
  let engagement = 0;
  let fit = 0;

  if (lead.email) engagement += 30;
  if (lead.phone) engagement += 20;
  if (lead.igHandle) engagement += 20;
  if (lead.location) fit += 25;
  if (lead.url) fit += 25;

  if (lead.email && lead.phone) engagement += 10;
  if (lead.igHandle && lead.location) fit += 25;
  if (lead.url && lead.location) fit += 25;

  const overall = Math.round((engagement + fit) / 2);

  return {
    overall: Math.min(100, overall),
    engagement: Math.min(100, engagement),
    fit: Math.min(100, fit),
  };
}

export const crmSync = tool({
  description:
    "Sync, deduplicate, normalize, and score leads in Supabase. Enriches lead data and calculates engagement/fit scores.",
  inputSchema: z.object({
    leadIds: z
      .array(z.string().uuid())
      .optional()
      .describe("Specific lead IDs to process. If not provided, processes all new leads"),
    autoEnrich: z
      .boolean()
      .default(true)
      .describe("Automatically enrich leads with missing data"),
  }),
  execute: async (input) => {
    try {
      let query = supabase.from("Lead").select("*");

      if (input.leadIds && input.leadIds.length > 0) {
        query = query.in("id", input.leadIds);
      } else {
        query = query.eq("status", "new");
      }

      const { data: leads, error } = await query;

      if (error) {
        return { error: `Database error: ${error.message}` };
      }

      if (!leads || leads.length === 0) {
        return { message: "No leads to process", processed: 0 };
      }

      const processed: string[] = [];
      const duplicates: string[] = [];
      const enriched: string[] = [];

      for (const lead of leads) {
        const updates: Record<string, unknown> = {};

        if (lead.email) {
          updates.email = normalizeEmail(lead.email);
        }

        if (lead.phone) {
          updates.phone = normalizePhone(lead.phone);
        }

        const score = calculateScore(lead);
        updates.score = score;

        if (Object.keys(updates).length > 0) {
          await supabase.from("Lead").update(updates).eq("id", lead.id);
        }

        const dedupeHash = lead.dedupeHash;
        if (dedupeHash) {
          const { data: duplicatesFound } = await supabase
            .from("Lead")
            .select("id")
            .eq("dedupeHash", dedupeHash)
            .neq("id", lead.id);

          if (duplicatesFound && duplicatesFound.length > 0) {
            duplicates.push(...duplicatesFound.map((d) => d.id));
            await supabase
              .from("Lead")
              .update({ status: "lost" })
              .eq("id", lead.id);
            continue;
          }
        }

        if (input.autoEnrich) {
          const needsEnrichment =
            !lead.email || !lead.phone || !lead.location || !lead.url;

          if (needsEnrichment) {
            enriched.push(lead.id);
          }
        }

        processed.push(lead.id);
      }

      return {
        success: true,
        processed: processed.length,
        duplicates: duplicates.length,
        enriched: enriched.length,
        leadIds: processed,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

