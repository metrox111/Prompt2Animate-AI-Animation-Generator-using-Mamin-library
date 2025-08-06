import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const animations = pgTable("animations", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  shape: text("shape").notNull(),
  color: text("color").notNull(),
  animationType: text("animation_type").notNull(),
  duration: integer("duration").notNull(),
  manimCode: text("manim_code"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnimationSchema = createInsertSchema(animations).pick({
  prompt: true,
  shape: true,
  color: true,
  animationType: true,
  duration: true,
  manimCode: true,
});

export const renderAnimationSchema = z.object({
  shape: z.enum(["circle", "square", "triangle"]),
  color: z.enum(["red", "blue", "green", "purple", "yellow"]),
  animationType: z.enum(["grow", "rotate", "fade", "move", "pulse"]),
  duration: z.number().min(1).max(10),
  manimCode: z.string().optional(),
});

export const promptParseSchema = z.object({
  prompt: z.string().min(1),
});

export type InsertAnimation = z.infer<typeof insertAnimationSchema>;
export type Animation = typeof animations.$inferSelect;
export type RenderAnimationRequest = z.infer<typeof renderAnimationSchema>;
export type PromptParseRequest = z.infer<typeof promptParseSchema>;
