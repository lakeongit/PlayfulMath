import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Trophy } from "lucide-react";
import DailyPuzzle from "@/components/DailyPuzzle";
import { Button } from "@/components/ui/button";
import type { DailyPuzzle as DailyPuzzleType } from "@shared/schema";

export default function DailyPuzzlePage() {
  const { user } = useAuth();
  const [showCelebration, setShowCelebration] = useState(false);

  const { data: puzzle, isLoading } = useQuery<DailyPuzzleType>({
    queryKey: ["/api/daily-puzzle"],
  });

  const solveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/daily-puzzle/solve", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to record solution");
      return res.json();
    },
    onSuccess: () => {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold">No Puzzle Available</h2>
        <p className="text-muted-foreground">
          Check back tomorrow for a new daily puzzle!
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[60vh]">
      <DailyPuzzle
        puzzle={puzzle}
        onSolve={() => solveMutation.mutate()}
      />

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="bg-card p-8 rounded-lg shadow-lg text-center"
            >
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-muted-foreground mb-4">
                You've solved today's puzzle! Come back tomorrow for a new challenge.
              </p>
              <Button
                onClick={() => setShowCelebration(false)}
                className="w-full"
              >
                Continue Learning
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
