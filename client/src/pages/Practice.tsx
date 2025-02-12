import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import MathProblem from "@/components/MathProblem";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TimerIcon } from "lucide-react";
import type { Problem } from "@shared/schema";

const SESSION_TIME = 10 * 60; // 10 minutes in seconds

export default function Practice() {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SESSION_TIME);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);

  const { data: problems, isLoading } = useQuery<Problem[]>({
    queryKey: ["/api/problems?grade=3"],
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setSessionActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSkip = () => {
    setCurrentProblemIndex((prev) => prev + 1);
  };

  const handleCorrectAnswer = () => {
    setShowCelebration(true);
    setSessionScore((prev) => prev + 10);
    setTimeout(() => {
      setShowCelebration(false);
      setCurrentProblemIndex((prev) => prev + 1);
    }, 2000);
  };

  const startSession = () => {
    setSessionActive(true);
    setTimeLeft(SESSION_TIME);
    setSessionScore(0);
    setCurrentProblemIndex(0);
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

  if (!sessionActive) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Practice?</h2>
            <p className="mb-6">Start a 10-minute practice session to improve your math skills!</p>
            {timeLeft === 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Session Complete!</h3>
                <p className="text-lg">Your score: {sessionScore} points</p>
              </div>
            )}
            <Button onClick={startSession} size="lg">
              {timeLeft === SESSION_TIME ? "Start Session" : "Start New Session"}
            </Button>
          </Card>
        </div>
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
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold">
              Score: {sessionScore}
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <TimerIcon className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={(timeLeft / SESSION_TIME) * 100} className="h-2" />
        </header>

        <AnimatePresence mode="wait">
          {currentProblem ? (
            <motion.div
              key={currentProblemIndex}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
            >
              <MathProblem
                problem={currentProblem}
                onCorrectAnswer={handleCorrectAnswer}
              />
              <div className="mt-4 flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="w-32"
                >
                  Skip
                </Button>
              </div>
            </motion.div>
          ) : (
            <Card className="p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-4">All Done!</h2>
              <p className="mb-4">You've completed all the problems!</p>
              <Button onClick={() => setCurrentProblemIndex(0)}>
                Start Over
              </Button>
            </Card>
          )}
        </AnimatePresence>
      </div>

      {showCelebration && <CelebrationOverlay />}
    </motion.div>
  );
}