import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ProgressPage() {
  const { data: user } = useQuery({
    queryKey: ["/api/users/1"], // Hardcoded user ID for demo
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements/1"],
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background p-6"
    >
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Your Progress</h1>
        </header>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Level {user?.level}</span>
                  <span>{user?.score} points</span>
                </div>
                <Progress value={65} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements?.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center p-4 bg-accent rounded-lg"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1571008840902-28bf8f9cd71a"
                      alt={achievement.type}
                      className="w-16 h-16 rounded-full mb-2"
                    />
                    <span className="text-sm font-medium">{achievement.type}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
