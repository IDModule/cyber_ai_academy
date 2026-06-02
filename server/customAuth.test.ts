import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function createUnauthContext(): { ctx: TrpcContext; setCookies: CookieCall[] } {
  const setCookies: CookieCall[] = [];

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };

  return { ctx, setCookies };
}

describe("auth.register", () => {
  it("validates email format", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        name: "Test User",
        email: "invalid-email",
        password: "123456",
      })
    ).rejects.toThrow();
  });

  it("validates password length", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        name: "Test User",
        email: "test@example.com",
        password: "123",
      })
    ).rejects.toThrow();
  });

  it("validates name length", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        name: "T",
        email: "test@example.com",
        password: "123456",
      })
    ).rejects.toThrow();
  });
});

describe("auth.login", () => {
  it("validates email format", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "not-an-email",
        password: "123456",
      })
    ).rejects.toThrow();
  });

  it("validates password is not empty", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "test@example.com",
        password: "",
      })
    ).rejects.toThrow();
  });
});

describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("auth.logout", () => {
  it("clears the session cookie", async () => {
    const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];

    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test_123",
        email: "test@example.com",
        name: "Test",
        loginMethod: "email",
        role: "user",
        passwordHash: null,
        avatarUrl: null,
        age: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as unknown as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
  });
});
