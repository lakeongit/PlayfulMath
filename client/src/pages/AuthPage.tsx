import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, resetPasswordSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as z from 'zod';

const SECURITY_QUESTIONS = [
  "What is your favorite color?",
  "What is your pet's name?",
  "What is your favorite subject in school?",
  "What is your favorite food?",
  "Who is your favorite teacher?"
];

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      grade: 3,
      securityQuestion: SECURITY_QUESTIONS[0],
      securityAnswer: "",
    },
  });

  const resetPasswordForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      username: "",
      securityAnswer: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof resetPasswordSchema>) => {
      const res = await apiRequest("POST", "/api/reset-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Successful",
        description: "You can now log in with your new password.",
      });
      resetPasswordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to PlayfulMath</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
                <TabsTrigger value="reset">Reset Password</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form
                  onSubmit={loginForm.handleSubmit((data) =>
                    loginMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      {...loginForm.register("username")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...loginForm.register("password")}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form
                  onSubmit={registerForm.handleSubmit((data) =>
                    registerMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Username</Label>
                    <Input
                      id="reg-username"
                      type="text"
                      {...registerForm.register("username")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      {...registerForm.register("password")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      {...registerForm.register("name")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade Level (3-5)</Label>
                    <Input
                      id="grade"
                      type="number"
                      min={3}
                      max={5}
                      {...registerForm.register("grade", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="securityQuestion">Security Question</Label>
                    <select
                      id="securityQuestion"
                      className="w-full p-2 border rounded"
                      {...registerForm.register("securityQuestion")}
                    >
                      {SECURITY_QUESTIONS.map((question) => (
                        <option key={question} value={question}>
                          {question}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="securityAnswer">Security Answer</Label>
                    <Input
                      id="securityAnswer"
                      type="text"
                      {...registerForm.register("securityAnswer")}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Register"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="reset">
                <form
                  onSubmit={resetPasswordForm.handleSubmit((data) =>
                    resetPasswordMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="reset-username">Username</Label>
                    <Input
                      id="reset-username"
                      type="text"
                      {...resetPasswordForm.register("username")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="securityAnswer">Security Answer</Label>
                    <Input
                      id="securityAnswer"
                      type="text"
                      {...resetPasswordForm.register("securityAnswer")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...resetPasswordForm.register("newPassword")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...resetPasswordForm.register("confirmPassword")}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending
                      ? "Resetting Password..."
                      : "Reset Password"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:flex flex-col items-center justify-center p-8 bg-primary/10">
        <Brain className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold mb-4">PlayfulMath</h1>
        <p className="text-lg text-center max-w-md">
          An adaptive learning platform designed to make math fun and engaging.
          Sign up to start your journey of mathematical discovery!
        </p>
      </div>
    </div>
  );
}