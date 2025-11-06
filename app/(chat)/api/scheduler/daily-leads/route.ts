import { NextRequest } from "next/server";
import { AlbaOrchestrator } from "@/lib/ai/orchestrator/alba";
import { supabase } from "@/lib/supabase/server";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const orchestrator = new AlbaOrchestrator();

    const { data: clients } = await supabase
      .from("Client")
      .select("id, name");

    if (!clients || clients.length === 0) {
      return Response.json({
        success: true,
        message: "No clients found",
        processed: 0,
      });
    }

    const results = [];

    for (const client of clients) {
      try {
        const result = await orchestrator.executeWorkflow("lead_daily", {
          query: "looking for salon brand OR opening hair salon OR salon for sale",
          clientId: client.id,
          maxResults: 20,
        });

        results.push({
          clientId: client.id,
          clientName: client.name,
          result,
        });
      } catch (error) {
        results.push({
          clientId: client.id,
          clientName: client.name,
          error:
            error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return Response.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

