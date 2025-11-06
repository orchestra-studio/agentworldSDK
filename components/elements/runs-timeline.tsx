"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AgentRun } from "@/lib/db/schema";
import { formatDistanceToNow } from "date-fns";

interface RunsTimelineProps {
  limit?: number;
}

export function RunsTimeline({ limit = 10 }: RunsTimelineProps) {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRuns() {
      try {
        const response = await fetch(`/api/runs?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setRuns(data.runs || []);
        }
      } catch (error) {
        console.error("Failed to fetch runs", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRuns();
  }, [limit]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Runs</CardTitle>
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
        <CardTitle>Recent Agent Runs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {runs.length === 0 ? (
            <div className="text-muted-foreground text-sm">No runs found</div>
          ) : (
            runs.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex-1">
                  <div className="font-medium">{run.agent}</div>
                  <div className="text-muted-foreground text-sm">
                    {run.startedAt &&
                      formatDistanceToNow(new Date(run.startedAt), {
                        addSuffix: true,
                      })}
                  </div>
                </div>
                <Badge
                  variant={
                    run.status === "completed"
                      ? "default"
                      : run.status === "failed"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {run.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

