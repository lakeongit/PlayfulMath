import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LightbulbIcon, HelpCircleIcon, PlayCircleIcon } from "lucide-react";
import AnimatedExplainer, { AdditionVisual, MultiplicationVisual } from "./AnimatedExplainer";
import type { Problem } from "@shared/schema";

interface MathProblemProps {
  problem: Problem;
  onCorrectAnswer: () => void;
}

export default function MathProblem({ problem, onCorrectAnswer }: MathProblemProps) {
  const [answer, setAnswer] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = answer.toLowerCase() === problem.answer.toLowerCase();

    if (isCorrect) {
      toast({
        title: "Correct!",
        description: "Great job solving this problem!",
        variant: "default",
      });
      onCorrectAnswer();
      setAnswer("");
      setShowExplanation(false);
      setShowHint(false);
      setShowAnimation(false);
    } else {
      toast({
        title: "Try Again",
        description: "That's not quite right. Try using the hint!",
        variant: "destructive",
      });
    }
  };

  const toggleHelp = () => {
    setShowHint(true);
    setShowExplanation(true);
  };

  const generateAnimationSteps = () => {
    if (problem.type === "addition") {
      const [num1, num2] = problem.question.match(/\d+/g)!.map(Number);
      return [
        {
          text: "Let's start with the ones place",
          visual: <AdditionVisual num1={num1} num2={num2} currentStep={0} />
        },
        {
          text: "Now move to the tens place",
          visual: <AdditionVisual num1={num1} num2={num2} currentStep={1} />
        },
        {
          text: "Finally, add the hundreds",
          visual: <AdditionVisual num1={num1} num2={num2} currentStep={2} />
        }
      ];
    } else if (problem.type === "multiplication") {
      const [num1, num2] = problem.question.match(/\d+/g)!.map(Number);
      return [
        {
          text: "First, let's multiply by the ones digit",
          visual: <MultiplicationVisual num1={num1} num2={num2} currentStep={0} />
        },
        {
          text: "Next, multiply by the tens digit",
          visual: <MultiplicationVisual num1={num1} num2={num2} currentStep={1} />
        },
        {
          text: "Finally, add the partial products",
          visual: <MultiplicationVisual num1={num1} num2={num2} currentStep={2} />
        }
      ];
    }
    return [];
  };

  const renderAnswerInput = () => {
    if (problem.options) {
      return (
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
      );
    }

    return (
      <Input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        className="text-lg text-center"
      />
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-2xl font-bold text-center mb-6">
            {problem.question}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderAnswerInput()}

            <div className="flex justify-center gap-4">
              <Button type="submit" size="lg">
                Check Answer
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={toggleHelp}
                className="gap-2"
              >
                <HelpCircleIcon className="w-5 h-5" />
                Help
              </Button>
              {(problem.type === "addition" || problem.type === "multiplication") && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowAnimation(true)}
                  className="gap-2"
                >
                  <PlayCircleIcon className="w-5 h-5" />
                  Show Animation
                </Button>
              )}
            </div>
          </form>

          <AnimatePresence>
            {(showHint || showExplanation) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                {showHint && problem.hint && (
                  <div className="mb-4 p-4 bg-primary/10 rounded-lg">
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

        <AnimatePresence>
          {showAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <AnimatedExplainer
                steps={generateAnimationSteps()}
                onClose={() => setShowAnimation(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}