import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  json,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { AppUsage } from "../usage";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  lastContext: jsonb("lastContext").$type<AppUsage | null>(),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  "Vote",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

// CRM Schema for Agent World

export const organization = pgTable("Organization", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Organization = InferSelectModel<typeof organization>;

export const client = pgTable("Client", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  organizationId: uuid("organizationId")
    .notNull()
    .references(() => organization.id),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }),
  igHandle: varchar("igHandle", { length: 255 }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Client = InferSelectModel<typeof client>;

export const project = pgTable("Project", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  clientId: uuid("clientId")
    .notNull()
    .references(() => client.id),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", {
    enum: ["active", "completed", "paused", "archived"],
  })
    .notNull()
    .default("active"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Project = InferSelectModel<typeof project>;

export const lead = pgTable(
  "Lead",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    clientId: uuid("clientId").references(() => client.id),
    source: varchar("source", { length: 100 }).notNull(),
    name: varchar("name", { length: 255 }),
    igHandle: varchar("igHandle", { length: 255 }),
    url: text("url"),
    location: varchar("location", { length: 255 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    status: varchar("status", {
      enum: ["new", "contacted", "qualified", "converted", "lost"],
    })
      .notNull()
      .default("new"),
    score: jsonb("score").$type<{
      overall?: number;
      engagement?: number;
      fit?: number;
    }>(),
    dedupeHash: varchar("dedupeHash", { length: 64 }),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    dedupeHashIdx: index("lead_dedupe_hash_idx").on(table.dedupeHash),
    clientIdIdx: index("lead_client_id_idx").on(table.clientId),
    statusIdx: index("lead_status_idx").on(table.status),
  })
);

export type Lead = InferSelectModel<typeof lead>;

export const leadEvent = pgTable("LeadEvent", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  leadId: uuid("leadId")
    .notNull()
    .references(() => lead.id),
  type: varchar("type", { length: 100 }).notNull(),
  payloadJson: jsonb("payloadJson").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type LeadEvent = InferSelectModel<typeof leadEvent>;

export const interaction = pgTable("Interaction", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  leadId: uuid("leadId").references(() => lead.id),
  channel: varchar("channel", { length: 50 }).notNull(),
  direction: varchar("direction", { enum: ["inbound", "outbound"] })
    .notNull()
    .default("outbound"),
  content: text("content").notNull(),
  metadataJson: jsonb("metadataJson").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Interaction = InferSelectModel<typeof interaction>;

export const agentRun = pgTable(
  "AgentRun",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    agent: varchar("agent", { length: 100 }).notNull(),
    inputJson: jsonb("inputJson").$type<Record<string, unknown>>(),
    outputJson: jsonb("outputJson").$type<Record<string, unknown>>(),
    status: varchar("status", {
      enum: ["pending", "running", "completed", "failed"],
    })
      .notNull()
      .default("pending"),
    startedAt: timestamp("startedAt"),
    finishedAt: timestamp("finishedAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("agent_run_status_idx").on(table.status),
    agentIdx: index("agent_run_agent_idx").on(table.agent),
  })
);

export type AgentRun = InferSelectModel<typeof agentRun>;

export const task = pgTable(
  "Task",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    runId: uuid("runId")
      .notNull()
      .references(() => agentRun.id),
    kind: varchar("kind", { length: 100 }).notNull(),
    status: varchar("status", {
      enum: ["pending", "running", "completed", "failed"],
    })
      .notNull()
      .default("pending"),
    inputJson: jsonb("inputJson").$type<Record<string, unknown>>(),
    outputJson: jsonb("outputJson").$type<Record<string, unknown>>(),
    error: text("error"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    runIdIdx: index("task_run_id_idx").on(table.runId),
    statusIdx: index("task_status_idx").on(table.status),
  })
);

export type Task = InferSelectModel<typeof task>;

export const memory = pgTable("Memory", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  content: text("content").notNull(),
  embedding: jsonb("embedding").$type<number[]>(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: uuid("entityId"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Memory = InferSelectModel<typeof memory>;

export const memoryLink = pgTable("MemoryLink", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: uuid("entityId").notNull(),
  memoryId: uuid("memoryId")
    .notNull()
    .references(() => memory.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type MemoryLink = InferSelectModel<typeof memoryLink>;
