import { 
  type User, type Problem, type Progress, type Achievement, type DailyPuzzle,
  type InsertUser, type InsertProblem, type InsertProgress, type InsertAchievement, type InsertDailyPuzzle
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";
import { users, problems, progress, achievements, dailyPuzzles } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import * as crypto from 'crypto';

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserScore(id: number, score: number): Promise<User>;
  updateUserProfile(id: number, data: { 
    name: string; 
    grade: number;
    securityQuestions: Array<{ question: string; answer: string; }>;
  }): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<User>;
  getUserBySecurityQuestionAnswer(
    username: string,
    question: string,
    answer: string
  ): Promise<User | undefined>;

  // Rest of the interface remains unchanged
  getProblems(grade: number): Promise<Problem[]>;
  getProblem(id: number): Promise<Problem | undefined>;
  getProgress(userId: number): Promise<Progress[]>;
  updateProgress(progress: InsertProgress): Promise<Progress>;
  getAchievements(userId: number): Promise<Achievement[]>;
  addAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievementProgress(id: number, progress: number): Promise<Achievement>;
  checkAndAwardAchievements(userId: number): Promise<Achievement[]>;
  getDailyPuzzle(): Promise<{ puzzle: Problem; reward: number } | undefined>;
  createDailyPuzzle(puzzle: InsertDailyPuzzle): Promise<DailyPuzzle>;
  checkDailyPuzzleCompletion(userId: number): Promise<boolean>;
  sessionStore: session.Store;
}

function encryptAnswer(answer: string): { encrypted: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.pbkdf2Sync(answer.toLowerCase().trim(), salt, 100000, 64, 'sha512');
  return {
    encrypted: key.toString('hex'),
    salt
  };
}

function verifyAnswer(attempt: string, encrypted: string, salt: string): boolean {
  const key = crypto.pbkdf2Sync(attempt.toLowerCase().trim(), salt, 100000, 64, 'sha512');
  return key.toString('hex') === encrypted;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
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

  async updateUserProfile(
    id: number, 
    data: { 
      name: string; 
      grade: number;
      securityQuestions: Array<{ question: string; answer: string; }>;
    }
  ): Promise<User> {
    try {
      // Validate input data
      if (!Array.isArray(data.securityQuestions) || data.securityQuestions.length !== 3) {
        throw new Error("Exactly 3 security questions are required");
      }

      // Encrypt each security answer before storage
      const encryptedQuestions = data.securityQuestions.map(q => {
        if (!q.question || !q.answer) {
          throw new Error("Both question and answer are required for security questions");
        }
        const { encrypted, salt } = encryptAnswer(q.answer);
        return {
          question: q.question.trim(),
          answer: encrypted,
          salt: salt
        };
      });

      const [updatedUser] = await db
        .update(users)
        .set({
          name: data.name.trim(),
          grade: data.grade,
          securityQuestions: encryptedQuestions
        })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) throw new Error("User not found");
      return updatedUser;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) throw new Error("User not found");
    return updatedUser;
  }

  async getUserBySecurityQuestionAnswer(
    username: string,
    question: string,
    answer: string
  ): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user?.securityQuestions) return undefined;

    const matchingQuestion = user.securityQuestions.find(
      sq => sq.question === question && verifyAnswer(answer, sq.answer, sq.salt)  
    );

    return matchingQuestion ? user : undefined;
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

  async updateAchievementProgress(id: number, progressValue: number): Promise<Achievement> {
    const [updatedAchievement] = await db
      .update(achievements)
      .set({ progress: progressValue })
      .where(eq(achievements.id, id))
      .returning();

    if (!updatedAchievement) throw new Error("Achievement not found");
    return updatedAchievement;
  }

  async checkAndAwardAchievements(userId: number): Promise<Achievement[]> {
    const userProgress = await this.getProgress(userId);
    const existingAchievements = await this.getAchievements(userId);
    const newAchievements: Achievement[] = [];

    // Check for achievements based on different criteria
    const completedProblems = userProgress.filter(p => p.completed).length;
    const achievementCriteria = [
      {
        type: "problem_solver",
        title: "Problem Solver",
        description: "Complete your first math problem",
        target: 1,
        category: "milestone",
        badgeIcon: "🎯",
        criteria: "problems_completed"
      },
      {
        type: "math_master",
        title: "Math Master",
        description: "Complete 10 math problems",
        target: 10,
        category: "milestone",
        badgeIcon: "🏆",
        criteria: "problems_completed"
      },
      {
        type: "daily_streak",
        title: "Daily Champion",
        description: "Complete 5 daily challenges",
        target: 5,
        category: "daily",
        badgeIcon: "🌟",
        criteria: "daily_challenges"
      }
    ];

    for (const criteria of achievementCriteria) {
      const hasAchievement = existingAchievements.some(a => a.type === criteria.type);
      if (!hasAchievement && completedProblems >= criteria.target) {
        const [newAchievement] = await db
          .insert(achievements)
          .values({
            userId,
            type: criteria.type,
            title: criteria.title,
            description: criteria.description,
            badgeIcon: criteria.badgeIcon,
            criteria: criteria.criteria,
            progress: completedProblems,
            target: criteria.target,
            category: criteria.category,
            earnedAt: new Date()
          })
          .returning();

        newAchievements.push(newAchievement);
      }
    }

    return newAchievements;
  }
  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUserByUsernameAndSecurityAnswer(
    username: string,
    securityAnswer: string
  ): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.username, username),
          eq(users.securityAnswer, securityAnswer)
        )
      );
    return user;
  }

  async getDailyPuzzle(): Promise<{ puzzle: Problem; reward: number } | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [dailyPuzzle] = await db
      .select()
      .from(dailyPuzzles)
      .where(
        and(
          gte(dailyPuzzles.date, today),
          lte(dailyPuzzles.date, tomorrow)
        )
      );

    if (!dailyPuzzle) return undefined;

    const puzzle = await this.getProblem(dailyPuzzle.problemId);
    if (!puzzle) return undefined;

    return {
      puzzle,
      reward: dailyPuzzle.reward
    };
  }

  async createDailyPuzzle(puzzle: InsertDailyPuzzle): Promise<DailyPuzzle> {
    const [newPuzzle] = await db
      .insert(dailyPuzzles)
      .values(puzzle)
      .returning();
    return newPuzzle;
  }

  async checkDailyPuzzleCompletion(userId: number): Promise<boolean> {
    const dailyPuzzle = await this.getDailyPuzzle();
    if (!dailyPuzzle) return false;

    const [userProgress] = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.problemId, dailyPuzzle.puzzle.id),
          eq(progress.completed, true)
        )
      );

    return !!userProgress;
  }
}

export const storage = new DatabaseStorage();

async function initializeSampleProblems() {
  console.log("Starting problem initialization...");

  try {
    const existingProblems = await db.select().from(problems);
    if (existingProblems.length > 0) {
      console.log(`Deleting ${existingProblems.length} existing problems...`);
      await db.delete(problems);
    }

    const allProblems: InsertProblem[] = [];

    // Generate problems for each grade level
    for (const grade of [3, 4, 5]) {
      allProblems.push(...generateAdditionProblems(grade, 50));
      allProblems.push(...generateSubtractionProblems(grade, 50));
      allProblems.push(...generateMultiplicationProblems(grade, 40));
      allProblems.push(...generateDivisionProblems(grade, 30));
      if (grade >= 4) {
        allProblems.push(...generateFractionProblems(grade, 40));
      }
      allProblems.push(...generateWordProblems(grade, 30));
      allProblems.push(...generateMultipleChoiceAddition(grade, 30));
      allProblems.push(...generateTrueFalseProblems(grade, 30));
    }

    console.log(`Generated ${allProblems.length} problems. Starting batch insert...`);

    // Insert problems in batches to avoid memory issues
    const batchSize = 50;
    for (let i = 0; i < allProblems.length; i += batchSize) {
      const batch = allProblems.slice(i, i + batchSize);
      await db.insert(problems).values(batch);
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1} (${batch.length} problems)`);
    }

    console.log("Problem initialization completed successfully.");
  } catch (error) {
    console.error("Error initializing problems:", error);
    throw error;
  }
}

function generateAdditionProblems(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];
  const maxNumber = grade === 3 ? 999 : grade === 4 ? 9999 : 99999;

  for (let i = 0; i < count; i++) {
    const num1 = Math.floor(Math.random() * maxNumber);
    const num2 = Math.floor(Math.random() * maxNumber);
    const sum = num1 + num2;

    const commonMistakes = [
      "Forgetting to carry over numbers",
      "Adding digits without considering place value",
      "Misaligning numbers during addition"
    ];

    const visualAid = grade === 3 ? 
      `number-line-${num1}-${num2}` : 
      `place-value-chart-${num1}-${num2}`;

    problems.push({
      grade,
      type: "addition",
      category: "arithmetic",
      question: `What is ${num1} + ${num2}?`,
      answer: sum.toString(),
      explanation: createDetailedExplanation("addition", num1, num2),
      hint: "Start from the right (ones place) and work your way left. Remember to carry when needed!",
      difficulty: Math.floor(1 + (num1.toString().length + num2.toString().length) / 3),
      commonMistakes,
      visualAid,
      requiredSteps: calculateRequiredSteps(num1, num2),
      skillLevel: determineSkillLevel(grade, num1, num2)
    });
  }
  return problems;
}

function createDetailedExplanation(operation: string, num1: number, num2: number): string {
  let explanation = `Let's solve ${num1} ${operation === "addition" ? "+" : operation === "subtraction" ? "-" : "×"} ${num2} step by step:\n\n`;

  const num1Str = num1.toString();
  const num2Str = num2.toString();
  const maxLength = Math.max(num1Str.length, num2Str.length);

  // Add place value explanation
  explanation += "1. Understanding place values:\n";
  explanation += createPlaceValueBreakdown(num1);
  explanation += createPlaceValueBreakdown(num2);

  // Add operation-specific steps
  if (operation === "addition") {
    explanation += createAdditionSteps(num1, num2);
  }

  // Add verification step
  explanation += "\nTo verify your answer:\n";
  explanation += "- Check that you've carried correctly\n";
  explanation += "- Verify each column's addition\n";
  explanation += "- Try estimating to see if your answer makes sense\n";

  return explanation;
}

function createPlaceValueBreakdown(num: number): string {
  const numStr = num.toString();
  const places = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'];
  let breakdown = `${num} = `;

  for (let i = 0; i < numStr.length; i++) {
    const digit = parseInt(numStr[numStr.length - 1 - i]);
    if (digit !== 0) {
      breakdown += `${digit} ${places[i]}${i < numStr.length - 1 ? " + " : ""}`;
    }
  }

  return breakdown + "\n";
}

function createAdditionSteps(num1: number, num2: number): string {
  const num1Str = num1.toString();
  const num2Str = num2.toString();
  const maxLength = Math.max(num1Str.length, num2Str.length);
  let steps = "\n2. Adding each place value:\n";
  let carry = 0;

  for (let i = 0; i < maxLength; i++) {
    const digit1 = parseInt(num1Str[num1Str.length - 1 - i]) || 0;
    const digit2 = parseInt(num2Str[num2Str.length - 1 - i]) || 0;
    const sum = digit1 + digit2 + carry;
    carry = Math.floor(sum / 10);

    steps += `   ${getPlaceName(i)}: ${digit1} + ${digit2}`;
    if (carry > 0) steps += ` + ${carry} (carried over)`;
    steps += ` = ${sum}\n`;
  }

  return steps;
}

function getPlaceName(index: number): string {
  const places = ['Ones', 'Tens', 'Hundreds', 'Thousands', 'Ten thousands'];
  return places[index] || `${index + 1}th place`;
}

function calculateRequiredSteps(num1: number, num2: number): number {
  // Calculate based on number of digits and carrying operations needed
  return Math.max(num1.toString().length, num2.toString().length);
}

function determineSkillLevel(grade: number, num1: number, num2: number): string {
  const complexity = (num1.toString().length + num2.toString().length) / 2;
  if (complexity <= grade - 2) return "beginner";
  if (complexity <= grade - 1) return "intermediate";
  return "advanced";
}

function generateSubtractionProblems(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];
  const maxNumber = grade === 3 ? 999 : grade === 4 ? 9999 : 99999;

  for (let i = 0; i < count; i++) {
    const result = Math.floor(Math.random() * maxNumber);
    const subtrahend = Math.floor(Math.random() * result);
    const minuend = result + subtrahend;

    problems.push({
      grade,
      type: "subtraction",
      category: "arithmetic",
      question: `What is ${minuend} - ${subtrahend}?`,
      answer: result.toString(),
      explanation: createDetailedExplanation("subtraction", minuend, subtrahend),
      hint: "Start from the right (ones place) and work your way left. Remember to borrow when needed!",
      difficulty: Math.floor(1 + minuend.toString().length / 2),
      commonMistakes: ["Forgetting to borrow", "Subtracting larger digits from smaller digits without borrowing", "Misaligning numbers"],
      visualAid: `number-line-${minuend}-${subtrahend}`,
      requiredSteps: calculateRequiredSteps(minuend, subtrahend),
      skillLevel: determineSkillLevel(grade, minuend, subtrahend)
    });
  }
  return problems;
}

function generateMultiplicationProblems(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];

  for (let i = 0; i < count; i++) {
    let num1: number, num2: number;

    if (grade === 3) {
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
    } else if (grade === 4) {
      num1 = Math.floor(Math.random() * 90) + 10;
      num2 = Math.floor(Math.random() * 90) + 10;
    } else {
      num1 = Math.floor(Math.random() * 900) + 100;
      num2 = Math.floor(Math.random() * 90) + 10;
    }

    const product = num1 * num2;

    problems.push({
      grade,
      type: "multiplication",
      category: "arithmetic",
      question: `What is ${num1} × ${num2}?`,
      answer: product.toString(),
      explanation: createDetailedExplanation("multiplication", num1, num2),
      hint: grade === 3 ?
        "Use your multiplication tables!" :
        "Break down the larger number and multiply each part separately.",
      difficulty: Math.floor(1 + (num1.toString().length + num2.toString().length) / 2),
      commonMistakes: ["Errors in multiplication facts", "Incorrect placement of partial products", "Forgetting to add partial products"],
      visualAid: `multiplication-table-${num1}-${num2}`,
      requiredSteps: calculateRequiredSteps(num1, num2),
      skillLevel: determineSkillLevel(grade, num1, num2)
    });
  }
  return problems;
}

function generateDivisionProblems(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];

  for (let i = 0; i < count; i++) {
    let divisor: number, quotient: number;

    if (grade === 3) {
      divisor = Math.floor(Math.random() * 9) + 2;
      quotient = Math.floor(Math.random() * 10) + 1;
    } else if (grade === 4) {
      divisor = Math.floor(Math.random() * 9) + 2;
      quotient = Math.floor(Math.random() * 100) + 10;
    } else {
      divisor = Math.floor(Math.random() * 90) + 10;
      quotient = Math.floor(Math.random() * 100) + 10;
    }

    const dividend = divisor * quotient;

    problems.push({
      grade,
      type: "division",
      category: "arithmetic",
      question: `What is ${dividend} ÷ ${divisor}?`,
      answer: quotient.toString(),
      explanation: createDetailedExplanation("division", dividend, divisor),
      hint: grade === 3 ?
        `Think about multiplication: what times ${divisor} equals ${dividend}?` :
        "Break down the problem into smaller steps and use your multiplication facts.",
      difficulty: Math.floor(1 + dividend.toString().length / 2),
      commonMistakes: ["Errors in multiplication facts", "Incorrect placement of partial products", "Forgetting to subtract partial products"],
      visualAid: `division-table-${dividend}-${divisor}`,
      requiredSteps: calculateRequiredSteps(dividend, divisor),
      skillLevel: determineSkillLevel(grade, dividend, divisor)
    });
  }
  return problems;
}

function generateFractionProblems(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];

  const denominators = grade === 3 ? [2, 3, 4, 5, 6, 8, 10] :
    grade === 4 ? [2, 3, 4, 5, 6, 8, 10, 12, 15] :
      [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25];

  for (let i = 0; i < count; i++) {
    if (grade === 3) {
      const denomIndex = Math.floor(Math.random() * denominators.length);
      const denom = denominators[denomIndex];
      const num1 = Math.floor(Math.random() * (denom - 1)) + 1;
      const num2 = Math.floor(Math.random() * (denom - num1)) + 1;

      problems.push({
        grade,
        type: "fractions",
        category: "fractions",
        question: `What is ${num1}/${denom} + ${num2}/${denom}?`,
        answer: `${num1 + num2}/${denom}`,
        explanation: `Adding fractions with the same denominator:\n\n` +
          `${num1}/${denom} + ${num2}/${denom}\n\n` +
          `Step 1: Keep the denominator (${denom}) the same\n` +
          `Step 2: Add the numerators: ${num1} + ${num2} = ${num1 + num2}\n` +
          `Step 3: Write the result: ${num1 + num2}/${denom}`,
        hint: "When adding fractions with the same denominator, add the top numbers (numerators) and keep the bottom number (denominator) the same.",
        difficulty: Math.floor(2 + denom / 4),
        commonMistakes: ["Adding denominators", "Incorrectly simplifying fractions"],
        visualAid: `fraction-model-${num1}-${num2}-${denom}`,
        requiredSteps: 3,
        skillLevel: "beginner"
      });
    } else if (grade === 4) {
      const denomIndex = Math.floor(Math.random() * denominators.length);
      const denom = denominators[denomIndex];
      const whole = Math.floor(Math.random() * 5) + 1;
      const num = Math.floor(Math.random() * (denom - 1)) + 1;

      const improperNum = whole * denom + num;
      problems.push({
        grade,
        type: "fractions",
        category: "fractions",
        question: `Convert ${whole} ${num}/${denom} to an improper fraction:`,
        answer: `${improperNum}/${denom}`,
        explanation: `Converting mixed number to improper fraction:\n\n` +
          `${whole} ${num}/${denom}\n\n` +
          `Step 1: Multiply the whole number by the denominator: ${whole} × ${denom} = ${whole * denom}\n` +
          `Step 2: Add the numerator: ${whole * denom} + ${num} = ${improperNum}\n` +
          `Step 3: Write as an improper fraction: ${improperNum}/${denom}`,
        hint: "Multiply the whole number by the denominator and add the numerator.",
        difficulty: 3,
        commonMistakes: ["Incorrectly multiplying the whole number", "Forgetting to add the numerator"],
        visualAid: `fraction-model-${whole}-${num}-${denom}`,
        requiredSteps: 3,
        skillLevel: "intermediate"
      });
    } else {
      const denom1 = denominators[Math.floor(Math.random() * denominators.length)];
      const denom2 = denominators[Math.floor(Math.random() * denominators.length)];
      const num1 = Math.floor(Math.random() * (denom1 - 1)) + 1;
      const num2 = Math.floor(Math.random() * (denom2 - 1)) + 1;

      const lcd = findLCD(denom1, denom2);
      const factor1 = lcd / denom1;
      const factor2 = lcd / denom2;
      const newNum1 = num1 * factor1;
      const newNum2 = num2 * factor2;

      problems.push({
        grade,
        type: "fractions",
        category: "fractions",
        question: `What is ${num1}/${denom1} + ${num2}/${denom2}?`,
        answer: `${newNum1 + newNum2}/${lcd}`,
        explanation: `Adding fractions with different denominators:\n\n` +
          `${num1}/${denom1} + ${num2}/${denom2}\n\n` +
          `Step 1: Find the least common denominator (LCD): ${lcd}\n` +
          `Step 2: Convert fractions to equivalent fractions with LCD:\n` +
          `  ${num1}/${denom1} = ${newNum1}/${lcd}\n` +
          `  ${num2}/${denom2} = ${newNum2}/${lcd}\n` +
          `Step 3: Add numerators: ${newNum1} + ${newNum2} = ${newNum1 + newNum2}\n` +
          `Final answer: ${newNum1 + newNum2}/${lcd}`,
        hint: "Find a common denominator first, then convert each fraction before adding.",
        difficulty: 4,
        commonMistakes: ["Incorrectly finding the LCD", "Errors in converting fractions", "Incorrectly adding numerators"],
        visualAid: `fraction-model-${num1}-${num2}-${denom1}-${denom2}`,
        requiredSteps: 4,
        skillLevel: "advanced"
      });
    }
  }
  return problems;
}

function findLCD(a: number, b: number): number {
  const findGCD = (x: number, y: number): number => (!y ? x : findGCD(y, x % y));
  return (a * b) / findGCD(a, b);
}

function generateWordProblems(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];

  const grade3Scenarios = [
    {
      template: "A store sells pencils for $PRICE each. How much would QUANTITY pencils cost?",
      type: "multiplication",
      maxPrice: 5,
      maxQuantity: 10
    },
    {
      template: "There are TOTAL marbles. If you share them equally among PEOPLE friends, how many marbles does each friend get?",
      type: "division",
      maxTotal: 50,
      maxPeople: 5
    }
  ];

  const grade4Scenarios = [
    {
      template: "A rectangle has a length of LENGTH cm and a width of WIDTH cm. What is its area?",
      type: "multiplication",
      maxLength: 20,
      maxWidth: 15
    },
    {
      template: "You have MONEY dollars to buy ITEMS items that cost PRICE dollars each. How much money will you have left?",
      type: "multi-step",
      maxMoney: 100,
      maxItems: 5,
      maxPrice: 15
    }
  ];

  const grade5Scenarios = [
    {
      template: "A recipe requires AMOUNT_1 cups of flour and AMOUNT_2 cups of sugar. If you want to make MULTIPLIER times the recipe, how many total cups of ingredients will you need?",
      type: "decimals",
      maxAmount: 2.5,
      maxMultiplier: 4
    },
    {
      template: "A train travels at SPEED kilometers per hour. How far will it travel in TIME hours and TIME_2 minutes?",
      type: "multi-step",
      maxSpeed: 100,
      maxTime: 3,
      maxTime2: 30
    }
  ];

  const scenarios = grade === 3 ? grade3Scenarios :
    grade === 4 ? grade4Scenarios :
      grade5Scenarios;

  for (let i = 0; i < count; i++) {
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    let question = scenario.template;
    let answer = "";
    let explanation = "";

    switch (scenario.type) {
      case "multiplication": {
        if (grade === 3) {
          const price = Math.ceil(Math.random() * scenario.maxPrice);
          const quantity = Math.ceil(Math.random() * scenario.maxQuantity);
          const total = price * quantity;
          question = question.replace("PRICE", price.toString())
            .replace("QUANTITY", quantity.toString());
          answer = total.toString();
          explanation = `Let's solve this step by step:\n\n` +
            `1. We need to multiply:\n` +
            `   ${price} dollars × ${quantity} pencils\n\n` +
            `2. ${price} × ${quantity} = ${total}\n\n` +
            `Therefore, ${quantity} pencils will cost $${total}`;
        } else {
          const length = Math.ceil(Math.random() * scenario.maxLength);
          const width = Math.ceil(Math.random() * scenario.maxWidth);
          const area = length * width;
          question = question.replace("LENGTH", length.toString())
            .replace("WIDTH", width.toString());
          answer = area.toString();
          explanation = `To find the area of a rectangle:\n\n` +
            `1. Multiply length × width\n``2. ${length} cm × ${width} cm = ${area} square cm\n\n` +
            `The area is ${area} square centimeters`;
        }
        break;
      }
      case "multi-step": {
        if (grade === 4) {
          const money = Math.ceil(Math.random() * scenario.maxMoney);
          const items = Math.ceil(Math.random() * scenario.maxItems);
          const price = Math.ceil(Math.random() * scenario.maxPrice);
          const total = items * price;
          const remaining = money- total;
          question = question.replace("MONEY", money.toString())
            .replace("ITEMS", items.toString())
            .replace("PRICE", price.toString());
          answer = remaining.toString();
          explanation = `Let's solve this in steps:\n\n` +
            `1. Calculate total cost:\n` +
            `   ${items} items × $${price} = $${total}\n\n` +
            `2. Subtract from money:\n` +
            `   $${money} - $${total} = $${remaining}\n\n` +
            `You will have $${remaining} left`;
        } else {
          const speed = Math.ceil(Math.random() * scenario.maxSpeed);
          const hours = Math.ceil(Math.random() * scenario.maxTime);
          const minutes = Math.ceil(Math.random() * scenario.maxTime2);
          const totalHours = hours + (minutes / 60);
          const distance = Math.round(speed * totalHours);
          question = question.replace("SPEED", speed.toString())
            .replace("TIME", hours.toString())
            .replace("TIME_2", minutes.toString());
          answer= distance.toString();
          explanation = `Let's solve this in steps:\n\n` +
            `1. Convert time to hours:\n` +
            `   ${hours} hours and ${minutes} minutes = ${totalHours.toFixed(2)} hours\n\n` +
            `2. Calculate distance:\n` +
            `   ${speed} km/h × ${totalHours.toFixed(2)} h = ${distance} km\nn\n` +
            `The train will travel ${distance} kilometers`;
        }
        break;
      }
      case "decimals": {
        const amount1 = +(Math.random() * scenario.maxAmount).toFixed(1);
        const amount2 = +(Math.random() * scenario.maxAmount).toFixed(1);
        const multiplier = Math.ceil(Math.random() * scenario.maxMultiplier);
        const total = ((amount1 + amount2) * multiplier).toFixed(1);
        question = question.replace("AMOUNT_1", amount1.toString())
          .replace("AMOUNT_2", amount2.toString())
          .replace("MULTIPLIER", multiplier.toString());
        answer = total.toString();
        explanation = `Let's solve this in steps:\n\n` +
          `1. Add the original ingredients:\n` +
          `   ${amount1} + ${amount2} = ${(amount1 + amount2).toFixed(1)} cups\n\n` +
          `2. Multiply by the recipe multiplier:\n` +
          `   ${(amount1 + amount2).toFixed(1)} × ${multiplier} = ${total} cups\n\n` +
          `You will need ${total} cups of ingredients`;
        break;
      }
      case "division": {
        if (grade === 3) {
          const total = Math.ceil(Math.random() * scenario.maxTotal);
          const people = Math.ceil(Math.random() * scenario.maxPeople);
          const marbles = Math.floor(total / people);
          question = question.replace("TOTAL", total.toString())
            .replace("PEOPLE", people.toString());
          answer = marbles.toString();
          explanation = `Let's solve this step by step:\n\n` +
            `1. We need to divide:\n` +
            `   ${total} marbles ÷ ${people} friends\n\n` +
            `2. ${total} ÷ ${people} = ${marbles}\n\n` +
            `Each friend gets ${marbles} marbles`;
        }
      }
    }

    problems.push({
      grade,
      type: "word_problems",
      category: "word_problems",
      question,
      answer,
      explanation,
      hint: grade === 3 ?
        "Read carefully and solve one step at a time!" :
        grade === 4 ?
          "Break down the problem into smaller parts and solve each part separately." :
          "Make sure to pay attention to units and decimal places in your calculations.",
      difficulty: grade - 2,
      commonMistakes: ["Misinterpreting the problem statement", "Using incorrect operations", "Making calculation errors"],
      visualAid: null,
      requiredSteps: grade,
      skillLevel: "intermediate"
    });
  }
  return problems;
}

function generateMultipleChoiceAddition(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];
  const maxNumber = grade === 3 ? 999 : grade === 4 ? 9999 : 99999;

  for (let i = 0; i < count; i++) {
    const num1 = Math.floor(Math.random() * maxNumber);
    const num2 = Math.floor(Math.random() * maxNumber);
    const correctSum = num1 + num2;

    const wrongAnswers = [
      (correctSum + Math.floor(Math.random() * 10) + 1).toString(),
      (correctSum - Math.floor(Math.random() * 10) - 1).toString(),
      (correctSum + Math.floor(Math.random() * 20) + 10).toString()
    ];

    const options = [...wrongAnswers, correctSum.toString()]
      .sort(() => Math.random() - 0.5);

    problems.push({
      grade,
      type: "multiple_choice_addition",
      category: "multiple_choice",
      question: `What is ${num1} + ${num2}?`,
      answer: correctSum.toString(),
      options,
      hint: "Try breaking down the numbers into smaller parts that are easier to add.",
      explanation: `Add the numbers column by column starting from the right. ${num1} + ${num2} = ${correctSum}`,
      difficulty: Math.floor(1 + (num1.toString().length + num2.toString().length) / 3),
      commonMistakes: ["Incorrectly adding digits", "Forgetting to carry-over", "Misunderstanding place value"],
      visualAid: null,
      requiredSteps: calculateRequiredSteps(num1, num2),
      skillLevel: determineSkillLevel(grade, num1, num2)
    });
  }
  return problems;
}

function generateTrueFalseProblems(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];
  const statements = [
    {
      template: "NUMBER1 + NUMBER2 = RESULT",
      type: "addition",
      generate: () => {
        const num1 = Math.floor(Math.random() * 100);
        const num2 = Math.floor(Math.random() * 100);
        const correctResult = num1 + num2;
        const showCorrect = Math.random() > 0.5;
        const shownResult = showCorrect ? correctResult : correctResult + Math.floor(Math.random() * 10) + 1;
        return {
          statement: `${num1} + ${num2} = ${shownResult}`,
          answer: showCorrect ? "true" : "false",
          explanation: showCorrect ?
            `Correct! ${num1} + ${num2} = ${correctResult}` :
            `Incorrect. ${num1} + ${num2} = ${correctResult}, not ${shownResult}`
        };
      }
    },
    {
      template: "NUMBER1 is greater than NUMBER2",
      type: "comparison",
      generate: () => {
        const num1 = Math.floor(Math.random() * 1000);
        const num2 = Math.floor(Math.random() * 1000);
        const isTrue = num1 > num2;
        return {
          statement: `${num1} is greater than ${num2}`,
          answer: isTrue ? "true" : "false",
          explanation: isTrue ?
            `Correct! ${num1} is greater than ${num2}` :
            `Incorrect. ${num1} is not greater than ${num2}`
        };
      }
    }
  ];

  for(let i = 0; i < count; i++) {
    const statement = statements[Math.floor(Math.random() * statements.length)];
    const problem = statement.generate();

    problems.push({
      grade,
      type: "true_false",
      category: "true_false",
      question: problem.statement,
      answer: problem.answer,
      options: ["true", "false"],
      hint: "Think carefully about the numbers and what the statement claims.",
      explanation: problem.explanation,
      difficulty: grade - 2,
      commonMistakes: ["Misunderstanding the comparison operator", "Making calculation errors"],
      visualAid: null,
      requiredSteps: 1,
      skillLevel: "beginner"
    });
  }
  return problems;
}

(async () => {
  try {
    await initializeSampleProblems();
  } catch (error) {
    console.error("Failed to initialize:", error);
  }
})();