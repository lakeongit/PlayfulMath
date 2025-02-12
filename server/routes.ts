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

  return httpServer;
}
