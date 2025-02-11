import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { User, Achievement } from "@shared/schema";

export default function ProgressPage() {
  const [, setLocation] = useLocation();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setLocation("/");
    }
  }, [userId, setLocation]);

  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: [`/api/achievements/${userId}`],
    enabled: !!userId,
  });

  if (!userId) return null;

  const levelProgress = ((user?.score ?? 0) % 100) / 100 * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background p-6"
    >
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Your Progress</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Keep up the great work, {user?.name}!
          </p>
        </header>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Level {user?.level ?? 1}</span>
                  <span>{user?.score ?? 0} points</span>
                </div>
                <Progress value={levelProgress} />
                <p className="text-sm text-muted-foreground mt-2">
                  {100 - (user?.score ?? 0) % 100} points until next level
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {achievements && achievements.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex flex-col items-center p-4 bg-accent rounded-lg"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                        <span className="text-2xl">🏆</span>
                      </div>
                      <span className="text-sm font-medium">{achievement.type}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Complete math problems to earn achievements!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
