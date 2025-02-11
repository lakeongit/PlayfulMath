import { 
  type User, type Problem, type Progress, type Achievement,
  type InsertUser, type InsertProblem, type InsertProgress, type InsertAchievement 
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private problems: Map<number, Problem>;
  private progress: Map<number, Progress>;
  private achievements: Map<number, Achievement>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.problems = new Map();
    this.progress = new Map();
    this.achievements = new Map();
    this.currentIds = { users: 1, problems: 1, progress: 1, achievements: 1 };
    
    // Initialize with sample math problems
    this.initializeSampleProblems();
  }

  private initializeSampleProblems() {
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
      // Add more sample problems as needed
    ];

    sampleProblems.forEach(problem => {
      const id = this.currentIds.problems++;
      this.problems.set(id, { ...problem, id });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const newUser = { ...user, id, score: 0, level: 1 };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUserScore(id: number, score: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, score };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getProblems(grade: number): Promise<Problem[]> {
    return Array.from(this.problems.values()).filter(p => p.grade === grade);
  }

  async getProblem(id: number): Promise<Problem | undefined> {
    return this.problems.get(id);
  }

  async getProgress(userId: number): Promise<Progress[]> {
    return Array.from(this.progress.values()).filter(p => p.userId === userId);
  }

  async updateProgress(progress: InsertProgress): Promise<Progress> {
    const id = this.currentIds.progress++;
    const newProgress = { ...progress, id };
    this.progress.set(id, newProgress);
    return newProgress;
  }

  async getAchievements(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(a => a.userId === userId);
  }

  async addAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentIds.achievements++;
    const newAchievement = { ...achievement, id };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }
}

export const storage = new MemStorage();
