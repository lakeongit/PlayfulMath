import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import MathProblem from "@/components/MathProblem";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Problem } from "@shared/schema";

export default function Practice() {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const { data: problems, isLoading } = useQuery<Problem[]>({
    queryKey: ["/api/problems?grade=3"],
  });

  const handleCorrectAnswer = () => {
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      setCurrentProblemIndex((prev) => prev + 1);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto p-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
    );
  }

  const currentProblem = problems?.[currentProblemIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background p-6"
    >
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Math Practice</h1>
        </header>

        {currentProblem ? (
          <MathProblem
            problem={currentProblem}
            onCorrectAnswer={handleCorrectAnswer}
          />
        ) : (
          <Card className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Great job!</h2>
            <p className="mb-4">You've completed all the problems!</p>
            <Button onClick={() => setCurrentProblemIndex(0)}>
              Start Over
            </Button>
          </Card>
        )}
      </div>

      {showCelebration && <CelebrationOverlay />}
    </motion.div>
  );
}