import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Award, LightbulbIcon, Brain } from "lucide-react";
import type { DailyPuzzle } from "@shared/schema";

interface DailyPuzzleProps {
  puzzle: DailyPuzzle;
  onSolve: () => void;
}

export default function DailyPuzzle({ puzzle, onSolve }: DailyPuzzleProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showSolution, setShowSolution] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
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

    setHasAttempted(true);
    const isCorrect = selectedAnswer === puzzle.answer;

    if (isCorrect) {
      toast({
        title: "Excellent Work! 🎉",
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{puzzle.title}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Daily Puzzle</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Real-world context */}
        <div className="bg-primary/10 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Real-World Application</h3>
          </div>
          <p className="text-sm">{puzzle.realWorldContext}</p>
        </div>

        {/* Scenario and Question */}
        <div className="space-y-4">
          <p className="text-lg">{puzzle.scenario}</p>
          <p className="font-semibold">{puzzle.question}</p>
        </div>

        {/* Visual Aid if available */}
        {puzzle.visualAid && (
          <div className="w-full flex justify-center">
            <img
              src={puzzle.visualAid}
              alt="Visual representation of the puzzle"
              className="max-w-full rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {puzzle.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === option ? "default" : "outline"}
              className={`w-full justify-start h-auto py-3 px-4 ${
                hasAttempted && option === puzzle.answer
                  ? "border-green-500 bg-green-50"
                  : ""
              }`}
              onClick={() => setSelectedAnswer(option)}
            >
              {option}
            </Button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowSolution(!showSolution)}
            className="gap-2"
          >
            <LightbulbIcon className="w-4 h-4" />
            {showSolution ? "Hide Solution" : "Show Solution"}
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Award className="w-4 h-4" />
            Submit Answer
          </Button>
        </div>

        {/* Solution Explanation */}
        <AnimatePresence>
          {showSolution && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-muted p-4 rounded-lg mt-4">
                <h3 className="font-semibold mb-2">Solution Explanation:</h3>
                <p className="whitespace-pre-wrap">{puzzle.explanation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
