import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const { data: runs, error } = await supabase
      .from("AgentRun")
      .select("*")
      .order("createdAt", { ascending: false })
      .limit(limit);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ runs: runs || [] });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

