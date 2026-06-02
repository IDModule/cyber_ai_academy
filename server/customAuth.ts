import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { users, type User } from "../drizzle/schema";
import { getDb } from "./db";
import { ENV } from "./_core/env";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";

const SALT_ROUNDS = 10;

function getSessionSecret() {
  const secret = ENV.cookieSecret;
  return new TextEncoder().encode(secret);
}

export async function registerUser(name: string, email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const db = await getDb();
  if (!db) return { success: false, error: "قاعدة البيانات غير متاحة" };

  // Check if email already exists
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return { success: false, error: "البريد الإلكتروني مسجل مسبقًا" };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Generate a unique openId for this user (email-based)
  const openId = `email_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Insert user
  await db.insert(users).values({
    openId,
    name,
    email,
    passwordHash,
    loginMethod: "email",
    role: "user",
    lastSignedIn: new Date(),
  });

  const newUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return { success: true, user: newUser[0] };
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const db = await getDb();
  if (!db) return { success: false, error: "قاعدة البيانات غير متاحة" };

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (result.length === 0) {
    return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }

  const user = result[0];
  if (!user.passwordHash) {
    return { success: false, error: "هذا الحساب مسجل بطريقة أخرى" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }

  // Update last signed in
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

  return { success: true, user };
}

export async function createSessionToken(userId: number, openId: string, name: string): Promise<string> {
  const issuedAt = Date.now();
  const expiresInMs = ONE_YEAR_MS;
  const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
  const secretKey = getSessionSecret();

  return new SignJWT({
    openId,
    appId: ENV.appId,
    name: name || "",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

export async function verifySessionToken(cookieValue: string | undefined | null): Promise<{ openId: string; name: string } | null> {
  if (!cookieValue) return null;

  try {
    const secretKey = getSessionSecret();
    const { payload } = await jwtVerify(cookieValue, secretKey, { algorithms: ["HS256"] });
    const { openId, name } = payload as Record<string, unknown>;

    if (typeof openId !== "string" || openId.length === 0) return null;

    return { openId, name: (name as string) || "" };
  } catch {
    return null;
  }
}

export async function authenticateRequest(req: Request): Promise<User | null> {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const parsed = parseCookieHeader(cookieHeader);
  const sessionCookie = parsed[COOKIE_NAME];
  const session = await verifySessionToken(sessionCookie);

  if (!session) return null;

  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.openId, session.openId)).limit(1);
  return result.length > 0 ? result[0] : null;
}
