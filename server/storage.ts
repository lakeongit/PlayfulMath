import { 
  type User, type Problem, type Progress, type Achievement,
  type InsertUser, type InsertProblem, type InsertProgress, type InsertAchievement 
} from "@shared/schema";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";
import { users, problems, progress, achievements } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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

  // Session store
  sessionStore: session.Store;
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

    // Create a detailed step-by-step explanation
    const num1Str = num1.toString();
    const num2Str = num2.toString();
    const maxLength = Math.max(num1Str.length, num2Str.length);
    const paddedNum1 = num1Str.padStart(maxLength, ' ');
    const paddedNum2 = num2Str.padStart(maxLength, ' ');

    let carryString = '';
    let carries = 0;
    let stepByStep = '';
    let currentSum = 0;

    // Check if carrying is needed
    for (let j = 1; j <= maxLength; j++) {
      const digit1 = parseInt(paddedNum1[maxLength - j]) || 0;
      const digit2 = parseInt(paddedNum2[maxLength - j]) || 0;
      currentSum = digit1 + digit2 + carries;
      if (currentSum >= 10) {
        carryString = '1' + carryString;
        carries = 1;
      } else {
        carryString = ' ' + carryString;
        carries = 0;
      }
    }

    // Only show carry line if there are carries
    const hasCarries = carryString.trim().length > 0;
    if (hasCarries) {
      stepByStep = `Step 1: Look at the carries:\n${carryString}\n`;
    }

    stepByStep += `Let's solve this step by step:\n\n`;
    stepByStep += `${paddedNum1}  ← First number\n`;
    stepByStep += `${paddedNum2}  ← Second number\n`;
    stepByStep += `${'—'.repeat(maxLength)}\n`;
    stepByStep += `${sum}  ← Final sum\n\n`;

    // Add column-by-column explanation
    const places = ['ones', 'tens', 'hundreds', 'thousands'];
    for (let j = 1; j <= maxLength; j++) {
      const place = places[j-1] || `${j}th place`;
      const digit1 = parseInt(paddedNum1[maxLength - j]) || 0;
      const digit2 = parseInt(paddedNum2[maxLength - j]) || 0;
      currentSum = digit1 + digit2 + (j === 1 ? 0 : carries);
      stepByStep += `${place}: ${digit1} + ${digit2}`;
      if (carries > 0) stepByStep += ` + ${carries} (carried over)`;
      stepByStep += ` = ${currentSum}`;
      if (currentSum >= 10) {
        stepByStep += ` (write ${currentSum % 10}, carry the 1)`;
        carries = 1;
      } else {
        carries = 0;
      }
      stepByStep += '\n';
    }

    problems.push({
      grade,
      type: "addition",
      question: `What is ${num1} + ${num2}?`,
      answer: sum.toString(),
      explanation: stepByStep,
      hint: "Start from the right (ones place) and work your way left. Remember to carry when needed!",
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

  for (let i = 0; i < count; i++) {
    let num1: number, num2: number;

    if (grade === 3) {
      // Grade 3: Up to 12 × 12
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
    } else if (grade === 4) {
      // Grade 4: Up to 2-digit × 2-digit
      num1 = Math.floor(Math.random() * 90) + 10;
      num2 = Math.floor(Math.random() * 90) + 10;
    } else {
      // Grade 5: Up to 3-digit × 2-digit
      num1 = Math.floor(Math.random() * 900) + 100;
      num2 = Math.floor(Math.random() * 90) + 10;
    }

    const product = num1 * num2;

    let explanation = `Let's solve ${num1} × ${num2} step by step:\n\n`;
    explanation += `${num1}\n`;
    explanation += `× ${num2}\n`;
    explanation += `${'—'.repeat(Math.max(num1.toString().length, num2.toString().length) + 1)}\n`;

    // Show multiplication steps
    if (num2 >= 10) {
      const ones = num2 % 10;
      const tens = Math.floor(num2 / 10);
      const firstStep = num1 * ones;
      const secondStep = num1 * tens * 10;

      explanation += `First multiply by ${ones}:\n`;
      explanation += `${num1} × ${ones} = ${firstStep}\n\n`;
      explanation += `Then multiply by ${tens}0:\n`;
      explanation += `${num1} × ${tens}0 = ${secondStep}\n\n`;
      explanation += `Finally, add the results:\n`;
      explanation += `${firstStep} + ${secondStep} = ${product}`;
    } else {
      explanation += `${product}  ← Final answer\n\n`;
      explanation += `Tip: You can think of this as adding ${num1} to itself ${num2} times!`;
    }

    problems.push({
      grade,
      type: "multiplication",
      question: `What is ${num1} × ${num2}?`,
      answer: product.toString(),
      explanation,
      hint: grade === 3 ? 
        "Use your multiplication tables!" : 
        "Break down the larger number and multiply each part separately.",
      difficulty: Math.floor(1 + (num1.toString().length + num2.toString().length) / 2)
    });
  }
  return problems;
}

function generateDivisionProblems(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];

  for (let i = 0; i < count; i++) {
    let divisor: number, quotient: number;

    if (grade === 3) {
      // Grade 3: Simple divisions up to 100 ÷ 10
      divisor = Math.floor(Math.random() * 9) + 2;
      quotient = Math.floor(Math.random() * 10) + 1;
    } else if (grade === 4) {
      // Grade 4: Up to 3-digit ÷ 1-digit
      divisor = Math.floor(Math.random() * 9) + 2;
      quotient = Math.floor(Math.random() * 100) + 10;
    } else {
      // Grade 5: Up to 4-digit ÷ 2-digit
      divisor = Math.floor(Math.random() * 90) + 10;
      quotient = Math.floor(Math.random() * 100) + 10;
    }

    const dividend = divisor * quotient;

    let explanation = `Let's divide ${dividend} by ${divisor}:\n\n`;
    explanation += `${dividend} ÷ ${divisor}\n\n`;

    if (grade === 3) {
      explanation += `Think: What number times ${divisor} equals ${dividend}?\n`;
      explanation += `${divisor} × ${quotient} = ${dividend}\n`;
      explanation += `So, ${dividend} ÷ ${divisor} = ${quotient}`;
    } else {
      explanation += `Step 1: Set up the division:\n`;
      explanation += `  ${dividend} ÷ ${divisor}\n\n`;
      explanation += `Step 2: Find how many times ${divisor} goes into ${dividend}:\n`;
      explanation += `${divisor} × ${quotient} = ${dividend}\n\n`;
      explanation += `Therefore, ${dividend} ÷ ${divisor} = ${quotient}`;
    }

    problems.push({
      grade,
      type: "division",
      question: `What is ${dividend} ÷ ${divisor}?`,
      answer: quotient.toString(),
      explanation,
      hint: grade === 3 ?
        `Think about multiplication: what times ${divisor} equals ${dividend}?` :
        "Break down the problem into smaller steps and use your multiplication facts.",
      difficulty: Math.floor(1 + dividend.toString().length / 2)
    });
  }
  return problems;
}

function generateFractionProblems(grade: number, count: number): InsertProblem[] {
  const problems: InsertProblem[] = [];

  // Define grade-appropriate denominators
  const denominators = grade === 3 ? [2, 3, 4, 5, 6, 8, 10] :
                      grade === 4 ? [2, 3, 4, 5, 6, 8, 10, 12, 15] :
                      [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25];

  for (let i = 0; i < count; i++) {
    if (grade === 3) {
      // Grade 3: Simple fractions with same denominators
      const denomIndex = Math.floor(Math.random() * denominators.length);
      const denom = denominators[denomIndex];
      const num1 = Math.floor(Math.random() * (denom - 1)) + 1;
      const num2 = Math.floor(Math.random() * (denom - num1)) + 1;

      const explanation = `Adding fractions with the same denominator:\n\n` +
        `${num1}/${denom} + ${num2}/${denom}\n\n` +
        `Step 1: Keep the denominator (${denom}) the same\n` +
        `Step 2: Add the numerators: ${num1} + ${num2} = ${num1 + num2}\n` +
        `Step 3: Write the result: ${num1 + num2}/${denom}`;

      problems.push({
        grade,
        type: "fractions",
        question: `What is ${num1}/${denom} + ${num2}/${denom}?`,
        answer: `${num1 + num2}/${denom}`,
        explanation,
        hint: "When adding fractions with the same denominator, add the top numbers (numerators) and keep the bottom number (denominator) the same.",
        difficulty: Math.floor(2 + denom / 4)
      });
    } else if (grade === 4) {
      // Grade 4: Mixed numbers and improper fractions
      const denomIndex = Math.floor(Math.random() * denominators.length);
      const denom = denominators[denomIndex];
      const whole = Math.floor(Math.random() * 5) + 1;
      const num = Math.floor(Math.random() * (denom - 1)) + 1;

      const improperNum = whole * denom + num;
      const explanation = `Converting mixed number to improper fraction:\n\n` +
        `${whole} ${num}/${denom}\n\n` +
        `Step 1: Multiply the whole number by the denominator: ${whole} × ${denom} = ${whole * denom}\n` +
        `Step 2: Add the numerator: ${whole * denom} + ${num} = ${improperNum}\n` +
        `Step 3: Write as an improper fraction: ${improperNum}/${denom}`;

      problems.push({
        grade,
        type: "fractions",
        question: `Convert ${whole} ${num}/${denom} to an improper fraction:`,
        answer: `${improperNum}/${denom}`,
        explanation,
        hint: "Multiply the whole number by the denominator and add the numerator.",
        difficulty: 3
      });
    } else {
      // Grade 5: Different denominators
      const denom1 = denominators[Math.floor(Math.random() * denominators.length)];
      const denom2 = denominators[Math.floor(Math.random() * denominators.length)];
      const num1 = Math.floor(Math.random() * (denom1 - 1)) + 1;
      const num2 = Math.floor(Math.random() * (denom2 - 1)) + 1;

      const lcd = findLCD(denom1, denom2);
      const factor1 = lcd / denom1;
      const factor2 = lcd / denom2;
      const newNum1 = num1 * factor1;
      const newNum2 = num2 * factor2;

      const explanation = `Adding fractions with different denominators:\n\n` +
        `${num1}/${denom1} + ${num2}/${denom2}\n\n` +
        `Step 1: Find the least common denominator (LCD): ${lcd}\n` +
        `Step 2: Convert fractions to equivalent fractions with LCD:\n` +
        `  ${num1}/${denom1} = ${newNum1}/${lcd}\n` +
        `  ${num2}/${denom2} = ${newNum2}/${lcd}\n` +
        `Step 3: Add numerators: ${newNum1} + ${newNum2} = ${newNum1 + newNum2}\n` +
        `Final answer: ${newNum1 + newNum2}/${lcd}`;

      problems.push({
        grade,
        type: "fractions",
        question: `What is ${num1}/${denom1} + ${num2}/${denom2}?`,
        answer: `${newNum1 + newNum2}/${lcd}`,
        explanation,
        hint: "Find a common denominator first, then convert each fraction before adding.",
        difficulty: 4
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
                      `1. Multiply length × width\n` +
                      `2. ${length} cm × ${width} cm = ${area} square cm\n\n` +
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
          const remaining = money - total;
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
          answer = distance.toString();
          explanation = `Let's solve this in steps:\n\n` +
                      `1. Convert time to hours:\n` +
                      `   ${hours} hours and ${minutes} minutes = ${totalHours.toFixed(2)} hours\n\n` +
                      `2. Calculate distance:\n` +
                      `   ${speed} km/h × ${totalHours.toFixed(2)} h = ${distance} km\n\n` +
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
      question,
      answer,
      explanation,
      hint: grade === 3 ? 
        "Read carefully and solve one step at a time!" :
        grade === 4 ?
        "Break down the problem into smaller parts and solve each part separately." :
        "Make sure to pay attention to units and decimal places in your calculations.",
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