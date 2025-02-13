import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  LightbulbIcon, 
  HelpCircleIcon, 
  PlayCircleIcon, 
  AlertTriangleIcon,
  ChevronRightIcon,
  BookOpenIcon
} from "lucide-react";
import AnimatedExplainer from "./AnimatedExplainer";
import type { Problem } from "@shared/schema";

interface MathProblemProps {
  problem: Problem;
  onCorrectAnswer: () => void;
  totalAttempts: number;
  correctAnswers: number;
}

export default function MathProblem({ 
  problem, 
  onCorrectAnswer,
  totalAttempts,
  correctAnswers 
}: MathProblemProps) {
  const [answer, setAnswer] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();

  const progressPercentage = totalAttempts > 0 
    ? (correctAnswers / totalAttempts) * 100 
    : 0;

  // Generate progressive hints based on problem type and difficulty
  const getProgressiveHints = () => {
    const hints = [];

    // Basic concept reminder
    hints.push({
      level: 1,
      text: problem.hint
    });

    // Strategy hint based on problem type
    switch (problem.type) {
      case "addition":
        hints.push({
          level: 2,
          text: "Break down the numbers by place value (ones, tens, hundreds) and add each column separately."
        });
        break;
      case "subtraction":
        hints.push({
          level: 2,
          text: "Start from the rightmost digit. Remember to borrow if needed!"
        });
        break;
      case "multiplication":
        hints.push({
          level: 2,
          text: "Break down the multiplication into smaller parts using the distributive property."
        });
        break;
      case "division":
        hints.push({
          level: 2,
          text: "Think about what number times the divisor equals the dividend (or gets close to it)."
        });
        break;
      default:
        hints.push({
          level: 2,
          text: "Break the problem into smaller, manageable steps."
        });
    }

    // Problem-specific hint
    if (problem.commonMistakes && problem.commonMistakes.length > 0) {
      hints.push({
        level: 3,
        text: `Watch out: ${problem.commonMistakes[0]}`
      });
    }

    return hints;
  };

  const hints = getProgressiveHints();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempts(prev => prev + 1);
    const isCorrect = answer.toLowerCase() === problem.answer.toLowerCase();

    if (isCorrect) {
      toast({
        title: "Correct! 🎉",
        description: `Great job solving this ${problem.skillLevel} level problem!`,
        variant: "default",
      });
      onCorrectAnswer();
      setAnswer("");
      setShowExplanation(false);
      setHintLevel(0);
      setShowAnimation(false);
      setAttempts(0);
    } else {
      const mistake = problem.commonMistakes?.[Math.floor(Math.random() * problem.commonMistakes.length)];
      toast({
        title: "Not quite right",
        description: mistake || "Try using the hint for help!",
        variant: "destructive",
      });

      // Progress hint level based on attempts
      if (attempts >= 1 && hintLevel < hints.length) {
        setHintLevel(prev => prev + 1);
      }
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "bg-green-500";
    if (difficulty <= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-500";
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-red-500";
      default: return "bg-blue-500";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {problem.category.charAt(0).toUpperCase() + problem.category.slice(1)}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className={getSkillLevelColor(problem.skillLevel)}>
              {problem.skillLevel}
            </Badge>
            <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
              Level {problem.difficulty}
            </Badge>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-2xl font-bold text-center">
            {problem.question}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {problem.options ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {problem.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={answer === option ? "default" : "outline"}
                    className="w-full text-left justify-start h-12 text-lg"
                    onClick={() => setAnswer(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <Input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="text-lg text-center"
              />
            )}

            <div className="flex flex-wrap gap-3 justify-center">
              <Button type="submit" size="lg" className="min-w-[120px]">
                Check Answer
              </Button>
              {hints.map((hint, index) => (
                <Button
                  key={index}
                  type="button"
                  variant={index < hintLevel ? "default" : "outline"}
                  size="lg"
                  onClick={() => setHintLevel(index + 1)}
                  className="gap-2 min-w-[120px]"
                  disabled={index >= hints.length || index >= hintLevel}
                >
                  <HelpCircleIcon className="w-5 h-5" />
                  Hint {index + 1}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setShowExplanation(!showExplanation)}
                className="gap-2 min-w-[120px]"
              >
                <BookOpenIcon className="w-5 h-5" />
                Solution
              </Button>
            </div>
          </form>

          <AnimatePresence>
            {hintLevel > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {hints.slice(0, hintLevel).map((hint, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-primary/10 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <LightbulbIcon className="w-5 h-5 text-primary" />
                      <h3 className="font-bold">Hint {hint.level}:</h3>
                    </div>
                    <p>{hint.text}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-muted rounded-lg"
              >
                <h3 className="font-bold mb-2">Step by Step Solution:</h3>
                <pre className="whitespace-pre-wrap font-mono text-sm bg-background p-3 rounded border">
                  {problem.explanation}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  );
}