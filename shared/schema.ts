import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  score: integer("score").notNull().default(0),
  questionsAnswered: integer("questions_answered").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  accuracy: real("accuracy").notNull().default(0),
  maxLevel: integer("max_level").notNull().default(1),
  totalTime: integer("total_time").notNull().default(0),
  studyMaterial: text("study_material"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalGamesPlayed: integer("total_games_played").notNull().default(0),
  totalScore: integer("total_score").notNull().default(0),
  totalQuestionsAnswered: integer("total_questions_answered").notNull().default(0),
  totalCorrectAnswers: integer("total_correct_answers").notNull().default(0),
  averageAccuracy: real("average_accuracy").notNull().default(0),
  highestScore: integer("highest_score").notNull().default(0),
  highestLevel: integer("highest_level").notNull().default(1),
  lastPlayedAt: timestamp("last_played_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions);
export const insertUserProgressSchema = createInsertSchema(userProgress);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
