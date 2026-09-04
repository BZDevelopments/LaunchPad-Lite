/**
 * Launchpad — Database Schema (hand-maintained, not auto-generated)
 *
 * Core (always present): user/session/account/verification (Better Auth),
 * subscriptions, ai_usage, files, waitlist.
 *
 * Module tables (only matter if the corresponding site-config.ts
 * features.modules.* flag is on — safe to ignore/leave empty otherwise):
 *   ai        → knowledge_bases, knowledge_documents, document_chunks
 *   shop      → products, orders, order_items
 *   content   → posts
 *   leads     → leads
 *   projects  → projects
 *
 * pgvector extension required for document_chunks:
 *   CREATE EXTENSION IF NOT EXISTS vector;
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  jsonb,
  uuid,
  index,
  uniqueIndex,
  pgEnum,
  vector,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
  "paused",
]);

export const aiProviderEnum = pgEnum("ai_provider", ["openai", "anthropic", "google"]);

export const fileStatusEnum = pgEnum("file_status", ["uploading", "processing", "ready", "error"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "fulfilled",
  "canceled",
  "refunded",
]);

export const postStatusEnum = pgEnum("post_status", ["draft", "published"]);

export const leadStatusEnum = pgEnum("lead_status", ["new", "contacted", "closed", "archived"]);

// ─── BETTER AUTH TABLES ────────────────────────────────────────────────────

export const users = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: text("role").notNull().default("user"),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("user_email_idx").on(t.email)]
);

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ─── SUBSCRIPTIONS (recurring billing — SaaS sites) ──────────────────────────

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    planId: text("plan_id").notNull().default("free"),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    provider: text("provider").notNull().default("stripe"),
    providerId: text("provider_id"),
    customerPortalUrl: text("customer_portal_url"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("subscriptions_user_idx").on(t.userId),
    index("subscriptions_provider_idx").on(t.providerId),
  ]
);

// ─── AI USAGE ─────────────────────────────────────────────────────────────────

export const aiUsage = pgTable(
  "ai_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    provider: aiProviderEnum("provider").notNull(),
    model: text("model").notNull(),
    promptTokens: integer("prompt_tokens").notNull().default(0),
    completionTokens: integer("completion_tokens").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),
    feature: text("feature").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("ai_usage_user_idx").on(t.userId), index("ai_usage_date_idx").on(t.createdAt)]
);

// ─── FILES ────────────────────────────────────────────────────────────────────

export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    storageKey: text("storage_key").notNull().unique(),
    contentType: text("content_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    status: fileStatusEnum("status").notNull().default("ready"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("files_user_idx").on(t.userId)]
);

// ─── KNOWLEDGE BASES / RAG (module: ai) ───────────────────────────────────────

export const knowledgeBases = pgTable(
  "knowledge_bases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    embeddingModel: text("embedding_model").notNull().default("text-embedding-3-small"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("kb_user_idx").on(t.userId)]
);

export const knowledgeDocuments = pgTable(
  "knowledge_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    knowledgeBaseId: uuid("knowledge_base_id").notNull().references(() => knowledgeBases.id, { onDelete: "cascade" }),
    fileId: uuid("file_id").references(() => files.id),
    name: text("name").notNull(),
    content: text("content"),
    status: fileStatusEnum("status").notNull().default("processing"),
    chunkCount: integer("chunk_count").default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("kb_doc_kb_idx").on(t.knowledgeBaseId)]
);

export const documentChunks = pgTable(
  "document_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id").notNull().references(() => knowledgeDocuments.id, { onDelete: "cascade" }),
    knowledgeBaseId: uuid("knowledge_base_id").notNull().references(() => knowledgeBases.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("chunk_document_idx").on(t.documentId),
    index("chunk_kb_idx").on(t.knowledgeBaseId),
    index("chunk_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  ]
);

// ─── COMMERCE (module: shop) ──────────────────────────────────────────────────

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    imageUrl: text("image_url"),
    active: boolean("active").notNull().default(true),
    inventory: integer("inventory"),
    stripePriceId: text("stripe_price_id"),
    stripeProductId: text("stripe_product_id"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("product_slug_idx").on(t.slug), index("product_owner_idx").on(t.ownerId)]
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    customerEmail: text("customer_email").notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    totalCents: integer("total_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    provider: text("provider").notNull().default("stripe"),
    providerSessionId: text("provider_session_id"),
    shippingAddress: jsonb("shipping_address"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("order_user_idx").on(t.userId), index("order_provider_session_idx").on(t.providerSessionId)]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull().references(() => products.id),
    productName: text("product_name").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull().default(1),
  },
  (t) => [index("order_item_order_idx").on(t.orderId)]
);

// ─── CONTENT (module: content) ────────────────────────────────────────────────

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    coverImageUrl: text("cover_image_url"),
    status: postStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("post_slug_idx").on(t.slug), index("post_author_idx").on(t.authorId)]
);

// ─── LEADS (module: leads) ─────────────────────────────────────────────────────

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company"),
    message: text("message").notNull(),
    status: leadStatusEnum("status").notNull().default("new"),
    source: text("source"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("lead_status_idx").on(t.status), index("lead_created_idx").on(t.createdAt)]
);

// ─── PROJECTS (module: projects) ──────────────────────────────────────────────

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    content: text("content"),
    coverImageUrl: text("cover_image_url"),
    tags: jsonb("tags").$type<string[]>().default([]),
    externalUrl: text("external_url"),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("project_slug_idx").on(t.slug), index("project_owner_idx").on(t.ownerId)]
);

// ─── WAITLIST ─────────────────────────────────────────────────────────────────

export const waitlist = pgTable(
  "waitlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    referredBy: text("referred_by"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("waitlist_email_idx").on(t.email)]
);

// ─── RELATIONS ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  subscription: one(subscriptions, { fields: [users.id], references: [subscriptions.userId] }),
  aiUsage: many(aiUsage),
  files: many(files),
  knowledgeBases: many(knowledgeBases),
  products: many(products),
  posts: many(posts),
  projects: many(projects),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));

export const knowledgeBasesRelations = relations(knowledgeBases, ({ one, many }) => ({
  user: one(users, { fields: [knowledgeBases.userId], references: [users.id] }),
  documents: many(knowledgeDocuments),
}));

export const knowledgeDocumentsRelations = relations(knowledgeDocuments, ({ one, many }) => ({
  knowledgeBase: one(knowledgeBases, { fields: [knowledgeDocuments.knowledgeBaseId], references: [knowledgeBases.id] }),
  file: one(files, { fields: [knowledgeDocuments.fileId], references: [files.id] }),
  chunks: many(documentChunks),
}));

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(knowledgeDocuments, { fields: [documentChunks.documentId], references: [knowledgeDocuments.id] }),
  knowledgeBase: one(knowledgeBases, { fields: [documentChunks.knowledgeBaseId], references: [knowledgeBases.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  owner: one(users, { fields: [products.ownerId], references: [users.id] }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
}));
