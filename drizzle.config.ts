import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Only load .env.local in development (not needed on Vercel)
// Vercel automatically injects environment variables into process.env
if (!process.env.VERCEL) {
  config({
    path: ".env.local",
  });
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // biome-ignore lint: Forbidden non-null assertion.
    url: process.env.POSTGRES_URL!,
  },
});
