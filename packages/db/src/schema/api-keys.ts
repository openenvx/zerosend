import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  prefix: text("prefix").notNull(),
  scopes: text("scopes").notNull().default('["send"]'),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
});

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(),
  defaultFrom: text("default_from"),
});
