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
    // Grade 3 Problems
    {
      grade: 3,
      type: "addition",
      question: "What is 125 + 237?",
      answer: "362",
      explanation: "Add the numbers column by column starting from the right: 5+7=12 (write 2, carry 1), 2+3+1=6, 1+2=3",
      difficulty: 1
    },
    {
      grade: 3,
      type: "subtraction",
      question: "What is 456 - 238?",
      answer: "218",
      explanation: "Subtract column by column with borrowing: 6-8 needs borrowing from 5, making it 16-8=8, 4-3=1, 4-2=2",
      difficulty: 1
    },
    {
      grade: 3,
      type: "multiplication",
      question: "What is 7 × 8?",
      answer: "56",
      explanation: "Use skip counting by 7 eight times or 8 seven times",
      difficulty: 2
    },
    // Grade 4 Problems
    {
      grade: 4,
      type: "division",
      question: "What is 72 ÷ 9?",
      answer: "8",
      explanation: "Think: how many 9s make 72? Count up by 9s: 9, 18, 27, 36, 45, 54, 63, 72. It takes 8 nines.",
      difficulty: 2
    },
    {
      grade: 4,
      type: "fractions",
      question: "What is 1/4 + 2/4?",
      answer: "3/4",
      explanation: "When fractions have the same denominator, add the numerators: 1 + 2 = 3, keep the denominator: 3/4",
      difficulty: 3
    },
    // Grade 5 Problems
    {
      grade: 5,
      type: "decimals",
      question: "What is 2.5 + 1.7?",
      answer: "4.2",
      explanation: "Line up the decimal points and add: 2.5 + 1.7 = 4.2",
      difficulty: 3
    },
    {
      grade: 5,
      type: "word_problems",
      question: "A store sells pencils for $0.75 each. How much would 6 pencils cost?",
      answer: "4.50",
      explanation: "Multiply $0.75 × 6 = $4.50. You can also think of it as 75 cents six times.",
      difficulty: 4
    },
    // Add more sample problems for each grade...
    // Grade 3 - More Addition
    {
      grade: 3,
      type: "addition",
      question: "What is 346 + 453?",
      answer: "799",
      explanation: "Add column by column: 6+3=9, 4+5=9, 3+4=7",
      difficulty: 2
    },
    // Grade 4 - More Complex Fractions
    {
      grade: 4,
      type: "fractions",
      question: "What is 3/8 + 2/8?",
      answer: "5/8",
      explanation: "Add numerators when denominators are the same: 3 + 2 = 5, keep denominator: 5/8",
      difficulty: 3
    },
    // Grade 5 - More Complex Word Problems
    {
      grade: 5,
      type: "word_problems",
      question: "If a rectangle has a length of 12 cm and a width of 5 cm, what is its area?",
      answer: "60",
      explanation: "Area of rectangle = length × width = 12 × 5 = 60 square centimeters",
      difficulty: 3
    }
  ];

  // Insert sample problems in batches to avoid memory issues
  const batchSize = 50;
  for (let i = 0; i < sampleProblems.length; i += batchSize) {
    const batch = sampleProblems.slice(i, i + batchSize);
    await db.insert(problems).values(batch);
  }
}

export const storage = new DatabaseStorage();
// Initialize sample data
initializeSampleProblems().catch(console.error);