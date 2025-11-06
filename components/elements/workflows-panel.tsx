"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  lastRun?: string;
}

const workflows: Workflow[] = [
  {
    id: "lead_daily",
    name: "Daily Lead Research",
    description: "Research leads daily using Exa and Apify",
    status: "active",
    lastRun: "2 hours ago",
  },
];

export function WorkflowsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflows</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="flex items-center justify-between border-b pb-3 last:border-0"
            >
              <div className="flex-1">
                <div className="font-medium">{workflow.name}</div>
                <div className="text-muted-foreground text-sm">
                  {workflow.description}
                </div>
                {workflow.lastRun && (
                  <div className="text-muted-foreground text-xs mt-1">
                    Last run: {workflow.lastRun}
                  </div>
                )}
              </div>
              <Badge
                variant={
                  workflow.status === "active"
                    ? "default"
                    : workflow.status === "paused"
                      ? "secondary"
                      : "outline"
                }
              >
                {workflow.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

