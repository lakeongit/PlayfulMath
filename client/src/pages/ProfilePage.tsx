import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateUserSchema, updatePasswordSchema } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const SECURITY_QUESTIONS = [
  "What is your favorite color?",
  "What is your pet's name?",
  "What is your favorite subject in school?",
  "What is your favorite food?",
  "Who is your favorite teacher?",
  "What is your favorite book?",
  "What city were you born in?",
  "What is your best friend's name?",
  "What is your favorite sport?",
  "What is your favorite movie?"
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAnswers, setShowAnswers] = useState<boolean[]>([false, false, false]);

  const { data: profileStatus } = useQuery({
    queryKey: ["/api/user/profile-status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/profile-status");
      return res.json();
    },
  });

  const profileForm = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user?.name || "",
      grade: user?.grade || 3,
      securityQuestions: user?.securityQuestions?.map(q => ({
        question: q.question,
        answer: ""
      })) || Array(3).fill({
        question: SECURITY_QUESTIONS[0],
        answer: ""
      })
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { 
      name: string; 
      grade: number;
      securityQuestions: Array<{ question: string; answer: string; }>
    }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      const res = await apiRequest("POST", "/api/user/password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isNewUser = !user?.name || !user?.securityQuestions?.length;

  return (
    <div className="container max-w-2xl py-8">
      {isNewUser && (
        <Alert className="mb-6" variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Complete Your Profile</AlertTitle>
          <AlertDescription>
            Please complete your profile by providing your full name, grade level, and security questions.
            This information is required to use the platform.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your account settings and security questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password" disabled={isNewUser}>Password</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit((data) =>
                    updateProfileMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Level (3-5)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={3}
                            max={5}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Security Questions</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose 3 different security questions and provide answers. These will help you recover your account if needed.
                    </p>

                    {[0, 1, 2].map((index) => (
                      <div key={index} className="space-y-4 p-4 border rounded-lg">
                        <FormField
                          control={profileForm.control}
                          name={`securityQuestions.${index}.question`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Question {index + 1}</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                required
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a security question" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SECURITY_QUESTIONS.map((question) => (
                                    <SelectItem
                                      key={question}
                                      value={question}
                                      disabled={profileForm
                                        .getValues("securityQuestions")
                                        ?.some((sq, i) => i !== index && sq.question === question)}
                                    >
                                      {question}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name={`securityQuestions.${index}.answer`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Answer {index + 1}</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type={showAnswers[index] ? "text" : "password"}
                                    placeholder="Enter your answer"
                                    required 
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                  onClick={() => {
                                    const newShowAnswers = [...showAnswers];
                                    newShowAnswers[index] = !newShowAnswers[index];
                                    setShowAnswers(newShowAnswers);
                                  }}
                                >
                                  {showAnswers[index] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="w-full"
                  >
                    {updateProfileMutation.isPending
                      ? "Updating..."
                      : isNewUser
                      ? "Complete Profile Setup"
                      : "Update Profile"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="password">
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit((data) =>
                    updatePasswordMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={updatePasswordMutation.isPending}
                    className="w-full"
                  >
                    {updatePasswordMutation.isPending
                      ? "Updating..."
                      : "Update Password"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}