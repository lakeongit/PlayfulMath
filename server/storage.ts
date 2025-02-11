import { 
  type User, type Problem, type Progress, type Achievement,
  type InsertUser, type InsertProblem, type InsertProgress, type InsertAchievement 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, problems, progress, achievements } from "@shared/schema";


export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserScore(id: number, score: number): Promise<User>;

  // Problem operations
  getProblems(grade: number): Promise<Problem[]>;
  getProblem(id: number): Promise<Problem | undefined>;

  // Progress operations
  getProgress(userId: number): Promise<Progress[]>;
  updateProgress(progress: InsertProgress): Promise<Progress>;

  // Achievement operations
  getAchievements(userId: number): Promise<Achievement[]>;
  addAchievement(achievement: InsertAchievement): Promise<Achievement>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUserScore(id: number, score: number): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ score })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) throw new Error("User not found");
    return updatedUser;
  }

  async getProblems(grade: number): Promise<Problem[]> {
    return await db
      .select()
      .from(problems)
      .where(eq(problems.grade, grade));
  }

  async getProblem(id: number): Promise<Problem | undefined> {
    const [problem] = await db
      .select()
      .from(problems)
      .where(eq(problems.id, id));
    return problem;
  }

  async getProgress(userId: number): Promise<Progress[]> {
    return await db
      .select()
      .from(progress)
      .where(eq(progress.userId, userId));
  }

  async updateProgress(progressData: InsertProgress): Promise<Progress> {
    const [newProgress] = await db
      .insert(progress)
      .values({
        ...progressData,
        completed: progressData.completed ?? false,
        attempts: progressData.attempts ?? 0,
        lastAttempt: progressData.lastAttempt ?? new Date()
      })
      .returning();
    return newProgress;
  }

  async getAchievements(userId: number): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId));
  }

  async addAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }
}

// Initialize sample problems
async function initializeSampleProblems() {
  const existingProblems = await db.select().from(problems);
  if (existingProblems.length > 0) return;

  const sampleProblems: InsertProblem[] = [
    {
      grade: 3,
      type: "addition",
      question: "What is 125 + 237?",
      answer: "362",
      explanation: "Add the numbers column by column starting from the right",
      difficulty: 1
    },
    {
      grade: 3,
      type: "multiplication",
      question: "What is 7 × 8?",
      answer: "56",
      explanation: "Use skip counting by 7 eight times or 8 seven times",
      difficulty: 2
    }
  ];

  await db.insert(problems).values(sampleProblems);
}

export const storage = new DatabaseStorage();
// Initialize sample data
initializeSampleProblems().catch(console.error);