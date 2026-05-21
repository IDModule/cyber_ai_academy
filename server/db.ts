import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userProgress, exerciseAttempts, examAttempts, certificates, badges, notifications } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Progress queries
export async function getUserProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userProgress).where(eq(userProgress.userId, userId));
}

export async function upsertProgress(userId: number, lessonId: string, gateId: string, completed: boolean, score: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)))
    .limit(1);
  if (existing.length > 0) {
    await db.update(userProgress)
      .set({ completed, score, completedAt: completed ? new Date() : null })
      .where(eq(userProgress.id, existing[0].id));
  } else {
    await db.insert(userProgress).values({
      userId, lessonId, gateId, completed, score,
      completedAt: completed ? new Date() : null
    });
  }
}

// Exercise attempts
export async function saveExerciseAttempt(userId: number, lessonId: string, exerciseId: string, answers: any, score: number, totalQuestions: number, passed: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.insert(exerciseAttempts).values({
    userId, lessonId, exerciseId, answers: JSON.stringify(answers), score, totalQuestions, passed
  });
}

export async function getExerciseAttempts(userId: number, lessonId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(exerciseAttempts)
    .where(and(eq(exerciseAttempts.userId, userId), eq(exerciseAttempts.lessonId, lessonId)))
    .orderBy(desc(exerciseAttempts.completedAt));
}

// Exam attempts
export async function saveExamAttempt(userId: number, gateId: string, answers: any, score: number, totalQuestions: number, passed: boolean, feedback: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(examAttempts).values({
    userId, gateId, answers: JSON.stringify(answers), score, totalQuestions, passed, feedback
  });
}

export async function getExamAttempts(userId: number, gateId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(examAttempts)
    .where(and(eq(examAttempts.userId, userId), eq(examAttempts.gateId, gateId)))
    .orderBy(desc(examAttempts.completedAt));
}

// Certificates
export async function issueCertificate(userId: number, gateId: string | null, type: "gate" | "platform", userName: string) {
  const db = await getDb();
  if (!db) return null;
  const certNumber = `CYBER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  await db.insert(certificates).values({
    userId, gateId, type, certificateNumber: certNumber, userName
  });
  return certNumber;
}

export async function getUserCertificates(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certificates).where(eq(certificates.userId, userId)).orderBy(desc(certificates.issuedAt));
}

// Badges
export async function awardBadge(userId: number, badgeType: string, badgeName: string, description: string) {
  const db = await getDb();
  if (!db) return;
  // Check if already has this badge
  const existing = await db.select().from(badges)
    .where(and(eq(badges.userId, userId), eq(badges.badgeType, badgeType)))
    .limit(1);
  if (existing.length > 0) return; // Already has badge
  await db.insert(badges).values({ userId, badgeType, badgeName, description });
}

export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(badges).where(eq(badges.userId, userId)).orderBy(desc(badges.earnedAt));
}

// Notifications
export async function createNotification(userId: number, type: "gate_complete" | "badge_earned" | "reminder" | "general", title: string, message: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values({ userId, type, title, message });
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function markNotificationRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, userId));
}

// Leaderboard
export async function getLeaderboard() {
  const db = await getDb();
  if (!db) return [];
  
  // Get all users with their stats
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    avatarUrl: users.avatarUrl,
  }).from(users);

  const leaderboardData = [];
  for (const u of allUsers) {
    // Count completed lessons
    const progress = await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, u.id), eq(userProgress.completed, true)));
    
    // Count badges
    const userBadges = await db.select().from(badges)
      .where(eq(badges.userId, u.id));
    
    // Count passed exams
    const passedExams = await db.select().from(examAttempts)
      .where(and(eq(examAttempts.userId, u.id), eq(examAttempts.passed, true)));
    
    // Calculate total score: lessons * 10 + badges * 25 + exams * 50
    const totalScore = (progress.length * 10) + (userBadges.length * 25) + (passedExams.length * 50);
    
    if (totalScore > 0) {
      leaderboardData.push({
        userId: u.id,
        name: u.name || "\u0645\u062a\u0639\u0644\u0645",
        avatarUrl: u.avatarUrl,
        completedLessons: progress.length,
        badgesCount: userBadges.length,
        passedExams: passedExams.length,
        totalScore,
      });
    }
  }

  // Sort by totalScore descending
  leaderboardData.sort((a, b) => b.totalScore - a.totalScore);
  return leaderboardData.slice(0, 50); // Top 50
}
