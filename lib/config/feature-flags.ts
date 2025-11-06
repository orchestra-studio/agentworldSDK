import "server-only";

export interface FeatureFlags {
  enableLeadResearch: boolean;
  enableBrowserOutreach: boolean;
  enableCrmSync: boolean;
  enableMemoryAccess: boolean;
  enableInstagramAutomation: boolean;
}

export function getFeatureFlags(): FeatureFlags {
  return {
    enableLeadResearch:
      process.env.FEATURE_LEAD_RESEARCH !== "false",
    enableBrowserOutreach:
      process.env.FEATURE_BROWSER_OUTREACH !== "false",
    enableCrmSync: process.env.FEATURE_CRM_SYNC !== "false",
    enableMemoryAccess:
      process.env.FEATURE_MEMORY_ACCESS !== "false",
    enableInstagramAutomation:
      process.env.FEATURE_INSTAGRAM_AUTOMATION === "true",
  };
}

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

