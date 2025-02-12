import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { LightbulbIcon, HelpCircleIcon, PlayCircleIcon, AlertTriangleIcon } from "lucide-react";
import AnimatedExplainer, { AdditionVisual, MultiplicationVisual } from "./AnimatedExplainer";
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
  const [showHint, setShowHint] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();

  const progressPercentage = totalAttempts > 0 
    ? (correctAnswers / totalAttempts) * 100 
    : 0;

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
      setShowHint(false);
      setShowAnimation(false);
      setAttempts(0);
    } else {
      // Show a random common mistake as feedback
      const mistake = problem.commonMistakes?.[Math.floor(Math.random() * problem.commonMistakes.length)];
      toast({
        title: "Not quite right",
        description: mistake || "Try using the hint for help!",
        variant: "destructive",
      });

      if (attempts >= 2) {
        setShowHint(true);
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
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setShowHint(!showHint)}
                className="gap-2 min-w-[120px]"
              >
                <HelpCircleIcon className="w-5 h-5" />
                Hint
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setShowExplanation(!showExplanation)}
                className="gap-2 min-w-[120px]"
              >
                <LightbulbIcon className="w-5 h-5" />
                Solution
              </Button>
            </div>
          </form>

          <AnimatePresence>
            {attempts > 0 && !showHint && !showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg"
              >
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertTriangleIcon className="w-5 h-5" />
                  <p>Need help? Try using the hint!</p>
                </div>
              </motion.div>
            )}

            {(showHint || showExplanation) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {showHint && problem.hint && (
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <LightbulbIcon className="w-5 h-5 text-primary" />
                      <h3 className="font-bold">Hint:</h3>
                    </div>
                    <p>{problem.hint}</p>
                  </div>
                )}

                {showExplanation && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-bold mb-2">Step by Step Solution:</h3>
                    <pre className="whitespace-pre-wrap font-mono text-sm bg-background p-3 rounded border">
                      {problem.explanation}
                    </pre>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  );
}