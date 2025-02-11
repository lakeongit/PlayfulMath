import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Home() {
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
            Learn math in a fun and interactive way!
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Practice Math</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Solve interactive math problems and earn rewards!</p>
              <Link href="/practice">
                <Button className="w-full" size="lg">
                  Start Practice
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">See how much you've learned and earned!</p>
              <Link href="/progress">
                <Button className="w-full" size="lg" variant="secondary">
                  View Progress
                </Button>
              </Link>
            </CardContent>
          </Card>
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
