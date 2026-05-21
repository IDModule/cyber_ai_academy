import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "طالب تجريبي",
      loginMethod: "manus",
      role: "user",
      avatarUrl: null,
      age: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("course.gates", () => {
  it("returns all 3 gates with correct structure", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const gates = await caller.course.gates();

    expect(gates).toHaveLength(3);
    expect(gates[0]).toHaveProperty("id", "gate-1");
    expect(gates[0]).toHaveProperty("title");
    expect(gates[0]).toHaveProperty("lessons");
    expect(gates[0].lessons).toHaveLength(2);
    expect(gates[1]).toHaveProperty("id", "gate-2");
    expect(gates[2]).toHaveProperty("id", "gate-3");
  });

  it("each gate has lessons with required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const gates = await caller.course.gates();

    for (const gate of gates) {
      for (const lesson of gate.lessons) {
        expect(lesson).toHaveProperty("id");
        expect(lesson).toHaveProperty("title");
        expect(lesson).toHaveProperty("description");
        expect(lesson).toHaveProperty("duration");
      }
    }
  });
});

describe("course.lesson", () => {
  it("returns lesson details for valid lessonId", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const lesson = await caller.course.lesson({ lessonId: "lesson-1-1" });

    expect(lesson).not.toBeNull();
    expect(lesson!.id).toBe("lesson-1-1");
    expect(lesson!.gateId).toBe("gate-1");
    expect(lesson!.content).toBeDefined();
    expect(lesson!.content.length).toBeGreaterThan(0);
    expect(lesson!.exercises).toBeDefined();
    expect(lesson!.exercises.length).toBeGreaterThan(0);
    expect(lesson!.objectives).toBeDefined();
  });

  it("returns null for invalid lessonId", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const lesson = await caller.course.lesson({ lessonId: "invalid-id" });
    expect(lesson).toBeNull();
  });
});

describe("course.gateExam", () => {
  it("returns exam questions for valid gateId", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const exam = await caller.course.gateExam({ gateId: "gate-1" });

    expect(exam).not.toBeNull();
    expect(exam!.gateId).toBe("gate-1");
    expect(exam!.questions).toBeDefined();
    expect(exam!.questions.length).toBeGreaterThan(0);
    
    for (const q of exam!.questions) {
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("question");
      expect(q).toHaveProperty("correctAnswer");
      expect(q).toHaveProperty("difficulty");
    }
  });

  it("returns null for invalid gateId", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const exam = await caller.course.gateExam({ gateId: "invalid-gate" });
    expect(exam).toBeNull();
  });
});

describe("protected routes require auth", () => {
  it("progress.get throws unauthorized for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.progress.get()).rejects.toThrow();
  });

  it("badges.list throws unauthorized for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.badges.list()).rejects.toThrow();
  });

  it("certificates.list throws unauthorized for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.certificates.list()).rejects.toThrow();
  });

  it("notifications.list throws unauthorized for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.notifications.list()).rejects.toThrow();
  });
});
