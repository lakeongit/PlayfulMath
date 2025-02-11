import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Problem } from "@shared/schema";

interface MathProblemProps {
  problem: Problem;
  onCorrectAnswer: () => void;
}

export default function MathProblem({ problem, onCorrectAnswer }: MathProblemProps) {
  const [answer, setAnswer] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (answer === problem.answer) {
      toast({
        title: "Correct!",
        description: "Great job solving this problem!",
        variant: "default",
      });
      onCorrectAnswer();
      setAnswer("");
      setShowExplanation(false);
    } else {
      toast({
        title: "Try Again",
        description: "That's not quite right. Keep trying!",
        variant: "destructive",
      });
      setShowExplanation(true);
    }
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="text-lg text-center"
            />

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
