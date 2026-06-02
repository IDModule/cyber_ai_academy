import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  avatarUrl: text("avatarUrl"),
  age: int("age"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Learning progress tracking per user per lesson
 */
export const userProgress = mysqlTable("user_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: varchar("lessonId", { length: 64 }).notNull(),
  gateId: varchar("gateId", { length: 64 }).notNull(),
  completed: boolean("completed").default(false).notNull(),
  score: int("score").default(0),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Exercise attempts
 */
export const exerciseAttempts = mysqlTable("exercise_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: varchar("lessonId", { length: 64 }).notNull(),
  exerciseId: varchar("exerciseId", { length: 64 }).notNull(),
  answers: json("answers"),
  score: int("score").default(0),
  totalQuestions: int("totalQuestions").default(0),
  passed: boolean("passed").default(false),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

/**
 * Gate (chapter) exam attempts
 */
export const examAttempts = mysqlTable("exam_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gateId: varchar("gateId", { length: 64 }).notNull(),
  answers: json("answers"),
  score: int("score").default(0),
  totalQuestions: int("totalQuestions").default(0),
  passed: boolean("passed").default(false),
  feedback: text("feedback"),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

/**
 * Certificates issued to users
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gateId: varchar("gateId", { length: 64 }),
  type: mysqlEnum("type", ["gate", "platform"]).notNull(),
  certificateNumber: varchar("certificateNumber", { length: 64 }).notNull().unique(),
  userName: varchar("userName", { length: 255 }).notNull(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
});

/**
 * Badges / achievements
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeType: varchar("badgeType", { length: 64 }).notNull(),
  badgeName: varchar("badgeName", { length: 255 }).notNull(),
  description: text("description"),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

/**
 * Notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["gate_complete", "badge_earned", "reminder", "general"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type ExerciseAttempt = typeof exerciseAttempts.$inferSelect;
export type ExamAttempt = typeof examAttempts.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
