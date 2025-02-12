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

function generateAdditionProblems(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];
  const maxNumber = grade === 3 ? 999 : grade === 4 ? 9999 : 99999;

  for (let i = 0; i < count; i++) {
    const num1 = Math.floor(Math.random() * maxNumber);
    const num2 = Math.floor(Math.random() * maxNumber);
    const sum = num1 + num2;

    problems.push({
      grade,
      type: "addition",
      question: `What is ${num1} + ${num2}?`,
      answer: sum.toString(),
      explanation: `Add the numbers column by column starting from the right. ${num1} + ${num2} = ${sum}`,
      difficulty: Math.floor(1 + (num1.toString().length + num2.toString().length) / 3)
    });
  }
  return problems;
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
      question: `What is ${minuend} - ${subtrahend}?`,
      answer: result.toString(),
      explanation: `Subtract ${subtrahend} from ${minuend} column by column.`,
      difficulty: Math.floor(1 + minuend.toString().length / 2)
    });
  }
  return problems;
}

function generateMultiplicationProblems(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];
  const maxNumber = grade === 3 ? 12 : grade === 4 ? 99 : 999;

  for (let i = 0; i < count; i++) {
    const num1 = Math.floor(Math.random() * maxNumber) + 1;
    const num2 = Math.floor(Math.random() * (grade === 3 ? 12 : 20)) + 1;
    const product = num1 * num2;

    problems.push({
      grade,
      type: "multiplication",
      question: `What is ${num1} × ${num2}?`,
      answer: product.toString(),
      explanation: `Multiply ${num1} by ${num2}. You can break it down into smaller steps if needed.`,
      difficulty: Math.floor(1 + (num1.toString().length + num2.toString().length) / 2)
    });
  }
  return problems;
}

function generateDivisionProblems(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];

  for (let i = 0; i < count; i++) {
    const divisor = Math.floor(Math.random() * (grade === 3 ? 12 : 20)) + 1;
    const quotient = Math.floor(Math.random() * (grade === 3 ? 10 : 100)) + 1;
    const dividend = divisor * quotient;

    problems.push({
      grade,
      type: "division",
      question: `What is ${dividend} ÷ ${divisor}?`,
      answer: quotient.toString(),
      explanation: `${dividend} divided by ${divisor} equals ${quotient}. Think: ${divisor} × ${quotient} = ${dividend}`,
      difficulty: Math.floor(1 + dividend.toString().length / 2)
    });
  }
  return problems;
}

function generateFractionProblems(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];
  const denominators = [2, 3, 4, 5, 6, 8, 10, 12];

  for (let i = 0; i < count; i++) {
    const denomIndex = Math.floor(Math.random() * denominators.length);
    const denom = denominators[denomIndex];
    const num1 = Math.floor(Math.random() * (denom - 1)) + 1;
    const num2 = Math.floor(Math.random() * (denom - num1)) + 1;

    problems.push({
      grade,
      type: "fractions",
      question: `What is ${num1}/${denom} + ${num2}/${denom}?`,
      answer: `${num1 + num2}/${denom}`,
      explanation: `When adding fractions with the same denominator, add the numerators and keep the denominator the same.`,
      difficulty: Math.floor(2 + denom / 4)
    });
  }
  return problems;
}

function generateWordProblems(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];
  const scenarios = [
    { template: "A store sells pencils for $PRICE each. How much would QUANTITY pencils cost?", type: "multiplication" },
    { template: "There are TOTAL students in a class. If they form groups of GROUP_SIZE, how many complete groups can they make?", type: "division" },
    { template: "A rectangle has a length of LENGTH cm and a width of WIDTH cm. What is its area?", type: "multiplication" },
    { template: "If you have TOTAL marbles and give GIVEN away, how many do you have left?", type: "subtraction" }
  ];

  for (let i = 0; i < count; i++) {
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    let question = scenario.template;
    let answer = "";
    let explanation = "";

    switch (scenario.type) {
      case "multiplication": {
        const price = (Math.floor(Math.random() * 20) + 1) * 0.25;
        const quantity = Math.floor(Math.random() * 20) + 1;
        const total = price * quantity;
        question = question.replace("PRICE", price.toFixed(2)).replace("QUANTITY", quantity.toString());
        answer = total.toFixed(2);
        explanation = `Multiply $${price.toFixed(2)} × ${quantity} = $${total.toFixed(2)}`;
        break;
      }
      case "division": {
        const groupSize = Math.floor(Math.random() * 5) + 2;
        const groups = Math.floor(Math.random() * 5) + 2;
        const total = groupSize * groups;
        question = question.replace("TOTAL", total.toString()).replace("GROUP_SIZE", groupSize.toString());
        answer = groups.toString();
        explanation = `Divide ${total} by ${groupSize} to find the number of groups`;
        break;
      }
      case "subtraction": {
        const total = Math.floor(Math.random() * 50) + 10;
        const given = Math.floor(Math.random() * total);
        const remaining = total - given;
        question = question.replace("TOTAL", total.toString()).replace("GIVEN", given.toString());
        answer = remaining.toString();
        explanation = `Subtract ${given} from ${total} to find how many are left.`;
        break;
      }
    }

    problems.push({
      grade,
      type: "word_problems",
      question,
      answer,
      explanation,
      difficulty: grade - 2
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

    // Generate wrong answers that are close to the correct sum
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
      question: `What is ${num1} + ${num2}?`,
      answer: correctSum.toString(),
      options,
      hint: "Try breaking down the numbers into smaller parts that are easier to add.",
      explanation: `Add the numbers column by column starting from the right. ${num1} + ${num2} = ${correctSum}`,
      difficulty: Math.floor(1 + (num1.toString().length + num2.toString().length) / 3)
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

  for (let i = 0; i < count; i++) {
    const statement = statements[Math.floor(Math.random() * statements.length)];
    const problem = statement.generate();

    problems.push({
      grade,
      type: "true_false",
      question: problem.statement,
      answer: problem.answer,
      options: ["true", "false"],
      hint: "Think carefully about the numbers and what the statement claims.",
      explanation: problem.explanation,
      difficulty: grade - 2
    });
  }
  return problems;
}

async function initializeSampleProblems() {
  console.log("Starting problem initialization...");

  try {
    const existingProblems = await db.select().from(problems);
    if (existingProblems.length > 0) {
      console.log(`Deleting ${existingProblems.length} existing problems...`);
      await db.delete(problems);
    }

    const allProblems: InsertProblem[] = [];

    for (const grade of [3, 4, 5]) {
      // Regular problems
      allProblems.push(...generateAdditionProblems(grade, 25));
      allProblems.push(...generateSubtractionProblems(grade, 25));
      allProblems.push(...generateMultiplicationProblems(grade, 20));
      allProblems.push(...generateDivisionProblems(grade, 15));

      // Multiple choice problems
      allProblems.push(...generateMultipleChoiceAddition(grade, 15));

      // True/False problems
      allProblems.push(...generateTrueFalseProblems(grade, 15));

      if (grade >= 4) {
        allProblems.push(...generateFractionProblems(grade, 20));
      }
      allProblems.push(...generateWordProblems(grade, 15));
    }

    console.log(`Generated ${allProblems.length} problems. Starting batch insert...`);

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

export const storage = new DatabaseStorage();

// Initialize problems and handle any errors
(async () => {
  try {
    await initializeSampleProblems();
  } catch (error) {
    console.error("Failed to initialize problems:", error);
  }
})();