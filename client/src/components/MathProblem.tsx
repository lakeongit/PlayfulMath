import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LightbulbIcon } from "lucide-react";
import type { Problem } from "@shared/schema";

interface MathProblemProps {
  problem: Problem;
  onCorrectAnswer: () => void;
}

export default function MathProblem({ problem, onCorrectAnswer }: MathProblemProps) {
  const [answer, setAnswer] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
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
    } else {
      toast({
        title: "Try Again",
        description: "That's not quite right. Keep trying!",
        variant: "destructive",
      });
      setShowExplanation(true);
    }
  };

  const renderAnswerInput = () => {
    if (problem.options) {
      return (
        <div className="space-y-2">
          {problem.options.map((option, index) => (
            <Button
              key={index}
              variant={answer === option ? "default" : "outline"}
              className="w-full text-left justify-start"
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
          <div className="text-2xl font-bold text-center">
            {problem.question}
          </div>

          {problem.hint && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="text-primary"
              >
                <LightbulbIcon className="w-4 h-4 mr-2" />
                {showHint ? "Hide Hint" : "Show Hint"}
              </Button>
              {showHint && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-muted-foreground"
                >
                  {problem.hint}
                </motion.p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {renderAnswerInput()}

            <div className="flex justify-center gap-4">
              <Button type="submit" size="lg">
                Check Answer
              </Button>
            </div>
          </form>

          {showExplanation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-muted rounded-lg"
            >
              <h3 className="font-bold mb-2">Explanation:</h3>
              <p>{problem.explanation}</p>
            </motion.div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}