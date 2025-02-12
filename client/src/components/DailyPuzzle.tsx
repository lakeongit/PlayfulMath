import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import type { DailyPuzzle } from "@shared/schema";

interface DailyPuzzleProps {
  puzzle: DailyPuzzle;
  onSolve: () => void;
}

export default function DailyPuzzle({ puzzle, onSolve }: DailyPuzzleProps) {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!selectedAnswer) {
      toast({
        title: "Select an Answer",
        description: "Please select an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    const isCorrect = selectedAnswer === puzzle.answer;
    if (isCorrect) {
      toast({
        title: "Correct! 🎉",
        description: "You've solved today's puzzle!",
      });
      onSolve();
    } else {
      toast({
        title: "Not Quite Right",
        description: "Try again or check the solution for help.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{puzzle.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-medium">{puzzle.question}</div>

        <div className="space-y-2">
          {puzzle.options?.map((option) => (
            <Button
              key={option}
              variant={selectedAnswer === option ? "default" : "outline"}
              className="w-full justify-start text-left"
              onClick={() => setSelectedAnswer(option)}
            >
              {option}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} className="flex-1">
            Submit Answer
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowSolution(!showSolution)}
          >
            {showSolution ? "Hide" : "Show"} Solution
          </Button>
        </div>

        {showSolution && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Solution:</h3>
            <p>{puzzle.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}