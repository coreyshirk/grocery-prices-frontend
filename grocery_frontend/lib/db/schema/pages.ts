import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { type getPages } from "@/lib/api/pages/queries";

import { nanoid, timestamps } from "@/lib/utils";

export const pages = sqliteTable("pages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  public: integer("public", { mode: "boolean" }).notNull().default(false),
  slug: text("slug").notNull().unique(),
  backgroundColor: text("background_color").notNull().default("#688663"),
  userId: text("user_id").notNull(),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Schema for pages - used to validate API requests
const baseSchema = createSelectSchema(pages).omit(timestamps);

export const insertPageSchema = createInsertSchema(pages).omit(timestamps);
export const insertPageParams = baseSchema
  .extend({
    // public: z.coerce.boolean(),
    slug: z
      .string()
      .min(5, { message: "Your slug must be at least 5 characters long." }),
  })
  .omit({
    public: true,
    backgroundColor: true,
    id: true,
    userId: true,
  });

export const updatePageSchema = baseSchema;
export const updatePageParams = baseSchema
  .extend({
    public: z.coerce.boolean(),
  })
  .omit({
    userId: true,
  });
export const pageIdSchema = baseSchema.pick({ id: true });
export const pageSlugSchema = baseSchema.pick({ slug: true });

// Types for pages - used to type API request params and within Components
export type Page = typeof pages.$inferSelect;
export type NewPage = z.infer<typeof insertPageSchema>;
export type NewPageParams = z.infer<typeof insertPageParams>;
export type UpdatePageParams = z.infer<typeof updatePageParams>;
export type PageId = z.infer<typeof pageIdSchema>["id"];
export type PageSlug = z.infer<typeof pageSlugSchema>["slug"];

// this type infers the return from getPages() - meaning it will include any joins
export type CompletePage = Awaited<
  ReturnType<typeof getPages>
>["pages"][number];
