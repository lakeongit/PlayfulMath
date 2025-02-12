import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(Number(req.params.id));
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Problem routes
  app.get("/api/problems", async (req, res) => {
    const grade = Number(req.query.grade);
    if (isNaN(grade)) {
      res.status(400).json({ error: "Invalid grade" });
      return;
    }
    const problems = await storage.getProblems(grade);
    res.json(problems);
  });

  // Progress routes
  app.get("/api/progress/:userId", async (req, res) => {
    const progress = await storage.getProgress(Number(req.params.userId));
    res.json(progress);
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const progress = await storage.updateProgress(req.body);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ error: "Invalid progress data" });
    }
  });

  // Achievement routes
  app.get("/api/achievements/:userId", async (req, res) => {
    const achievements = await storage.getAchievements(Number(req.params.userId));
    res.json(achievements);
  });

  app.post("/api/achievements", async (req, res) => {
    try {
      const achievement = await storage.addAchievement(req.body);
      res.json(achievement);
    } catch (error) {
      res.status(400).json({ error: "Invalid achievement data" });
    }
  });

  // Daily Puzzle routes
  app.get("/api/daily-puzzle", async (_req, res) => {
    try {
      const puzzle = await storage.getDailyPuzzle();
      if (!puzzle) {
        res.status(404).json({ error: "No puzzle available for today" });
        return;
      }
      res.json(puzzle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily puzzle" });
    }
  });

  app.post("/api/daily-puzzle/solve", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      // Update user score and record the attempt
      const user = await storage.updateUserScore(req.user.id, req.user.score + 10);
      res.json({ message: "Solution recorded", user });
    } catch (error) {
      res.status(500).json({ error: "Failed to record solution" });
    }
  });

  return httpServer;
}