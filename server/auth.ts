import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema, updateUserSchema, updatePasswordSchema, resetPasswordSchema } from "@shared/schema";
import * as z from 'zod';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        // Instead of error, return null which will clear the invalid session
        return done(null, null);
      }
      done(null, user);
    } catch (error) {
      // Log error but don't crash the app
      console.error('Error deserializing user:', error);
      done(null, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);

      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  app.get("/api/user/profile-status", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const user = req.user;
    const isComplete = !!(
      user.name && 
      user.grade && 
      user.email
    );

    res.json({ 
      isComplete,
      hasName: !!user.name,
      hasGrade: !!user.grade,
      hasEmail: !!user.email
    });
  });

  app.patch("/api/user/profile", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const updateData = updateUserSchema.parse(req.body);

      // Check if email is already in use by another user
      const existingUser = await storage.getUserByEmail(updateData.email);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ message: "Email is already in use" });
      }

      const updatedUser = await storage.updateUserProfile(req.user.id, updateData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.post("/api/user/password", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { currentPassword, newPassword } = updatePasswordSchema.parse(req.body);
      const user = await storage.getUser(req.user.id);

      if (!user || !(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const updatedUser = await storage.updateUserPassword(
        req.user.id,
        await hashPassword(newPassword)
      );

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { username, email, newPassword } = resetPasswordSchema.parse(req.body);

      // Find user by username and verify email
      const user = await storage.getUserByUsername(username);
      if (!user || user.email !== email.toLowerCase()) {
        return res.status(400).json({ message: "Invalid username or email" });
      }

      const updatedUser = await storage.updateUserPassword(
        user.id,
        await hashPassword(newPassword)
      );

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });
}