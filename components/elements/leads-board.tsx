"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/lib/db/schema";

interface LeadsBoardProps {
  limit?: number;
}

export function LeadsBoard({ limit = 10 }: LeadsBoardProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch(`/api/leads?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setLeads(data.leads || []);
        }
      } catch (error) {
        console.error("Failed to fetch leads", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, [limit]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leads.length === 0 ? (
            <div className="text-muted-foreground text-sm">No leads found</div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex-1">
                  <div className="font-medium">{lead.name || "Unknown"}</div>
                  <div className="text-muted-foreground text-sm">
                    {lead.igHandle && `@${lead.igHandle}`}
                    {lead.location && ` • ${lead.location}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{lead.status}</Badge>
                  {lead.score?.overall && (
                    <Badge variant="secondary">
                      Score: {lead.score.overall}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

