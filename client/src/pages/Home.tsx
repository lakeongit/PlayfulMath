import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Brain, BarChart3, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Math Adventure</h1>
          <p className="text-lg text-muted-foreground">
            {user ? `Welcome back, ${user?.name}! Ready to continue your learning journey?` : "Learn math in a fun and interactive way!"}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/practice">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Practice Math
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Solve interactive math problems and earn rewards!</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/memory-cards">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Memory Cards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Review concepts with interactive flashcards!</p>
              </CardContent>
            </Card>
          </Link>


          <Link href="/daily-puzzle">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Daily Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Test your skills with today's special puzzle!</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/progress">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Track Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>See how much you've learned and earned!</p>
              </CardContent>
            </Card>
          </Link>
        </div>
        <div className="mt-12 text-center">
          <img 
            src="https://images.unsplash.com/photo-1509228627152-72ae9ae6848d"
            alt="Math Learning"
            className="rounded-lg mx-auto max-w-md"
          />
        </div>
      </motion.div>
    </div>
  );
}