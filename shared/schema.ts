import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  grade: integer("grade").notNull(),
  score: integer("score").notNull().default(0),
  level: integer("level").notNull().default(1)
});

export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  grade: integer("grade").notNull(),
  type: text("type").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  explanation: text("explanation").notNull(),
  hint: text("hint"),
  options: text("options").array(),
  difficulty: integer("difficulty").notNull()
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  problemId: integer("problem_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  attempts: integer("attempts").notNull().default(0),
  lastAttempt: timestamp("last_attempt")
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  earnedAt: timestamp("earned_at").notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  grade: true
});

export const insertProblemSchema = createInsertSchema(problems);
export const insertProgressSchema = createInsertSchema(progress);
export const insertAchievementSchema = createInsertSchema(achievements);

export type User = typeof users.$inferSelect;
export type Problem = typeof problems.$inferSelect;
export type Progress = typeof progress.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;