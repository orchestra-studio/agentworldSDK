import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const { data: leads, error } = await supabase
      .from("Lead")
      .select("*")
      .order("createdAt", { ascending: false })
      .limit(limit);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ leads: leads || [] });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

