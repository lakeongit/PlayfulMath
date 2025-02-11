import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !grade) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and select your grade.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiRequest("POST", "/api/users", {
        name,
        grade: parseInt(grade),
      });
      const user = await response.json();
      localStorage.setItem("userId", user.id.toString());
      setLocation("/practice");
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Your Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Grade 3</SelectItem>
                    <SelectItem value="4">Grade 4</SelectItem>
                    <SelectItem value="5">Grade 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isCreating}>
                {isCreating ? "Creating..." : "Start Learning"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Practice Math</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Solve interactive math problems and earn rewards!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">See how much you've learned and earned!</p>
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