import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").default(''),
  grade: integer("grade"),
  score: integer("score").notNull().default(0),
  level: integer("level").notNull().default(1),
  securityQuestions: jsonb("security_questions").$type<Array<{
    question: string;
    answer: string;    // This will store the encrypted answer
    salt: string;      // Salt used for encryption
  }>>()
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
  difficulty: integer("difficulty").notNull(),
  category: text("category").notNull(),
  visualAid: text("visual_aid"),
  requiredSteps: integer("required_steps"),
  skillLevel: text("skill_level"),
  commonMistakes: text("common_mistakes").array()
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  problemId: integer("problem_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  attempts: integer("attempts").notNull().default(0),
  lastAttempt: timestamp("last_attempt")
});

export const dailyPuzzles = pgTable("daily_puzzles", {
  id: serial("id").primaryKey(),
  problemId: integer("problem_id").notNull(),
  date: timestamp("date").notNull(),
  reward: integer("reward").notNull().default(10)
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  earnedAt: timestamp("earned_at").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  badgeIcon: text("badge_icon").notNull(),
  criteria: text("criteria").notNull(),
  progress: integer("progress").notNull().default(0),
  target: integer("target").notNull(),
  category: text("category").notNull()
});

const securityQuestionSchema = z.object({
  question: z.string().min(1, "Security question is required"),
  answer: z.string().min(1, "Security answer is required")
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true
  })
  .extend({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters")
  });

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  grade: z.number().min(3).max(5, "Grade must be between 3 and 5"),
  securityQuestions: z.array(securityQuestionSchema)
    .min(3, "Please provide 3 security questions")
    .max(3, "Maximum 3 security questions allowed")
    .refine(
      (questions) => {
        const uniqueQuestions = new Set(questions.map(q => q.question));
        return uniqueQuestions.size === questions.length;
      },
      {
        message: "All security questions must be different"
      }
    )
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const resetPasswordSchema = z.object({
  username: z.string().min(1, "Username is required"),
  securityQuestion: z.string().min(1, "Security question is required"),
  securityAnswer: z.string().min(1, "Security answer is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type User = typeof users.$inferSelect;
export type Problem = typeof problems.$inferSelect;
export type Progress = typeof progress.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type DailyPuzzle = typeof dailyPuzzles.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertDailyPuzzle = z.infer<typeof insertDailyPuzzleSchema>;

export const insertProblemSchema = createInsertSchema(problems);
export const insertProgressSchema = createInsertSchema(progress);
export const insertAchievementSchema = createInsertSchema(achievements);
export const insertDailyPuzzleSchema = createInsertSchema(dailyPuzzles);