// @vitest-environment node
import { webcrypto } from "node:crypto";
// @ts-ignore
globalThis.crypto = webcrypto;

import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify, SignJWT } from "jose";

const mockSet = vi.fn();
const mockGet = vi.fn();
const mockCookieStore = { set: mockSet, get: mockGet };

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const { createSession, getSession } = await import("@/lib/auth");

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

async function makeToken(payload: object, expiresIn = "7d") {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

beforeEach(() => {
  mockSet.mockClear();
  mockGet.mockClear();
});

test("sets an httpOnly cookie named auth-token", async () => {
  await createSession("user-1", "test@example.com");

  expect(mockSet).toHaveBeenCalledOnce();
  const [name, , options] = mockSet.mock.calls[0];
  expect(name).toBe("auth-token");
  expect(options.httpOnly).toBe(true);
});

test("cookie has correct sameSite and path", async () => {
  await createSession("user-1", "test@example.com");

  const [, , options] = mockSet.mock.calls[0];
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("cookie expires in ~7 days", async () => {
  const before = Date.now();
  await createSession("user-1", "test@example.com");
  const after = Date.now();

  const [, , options] = mockSet.mock.calls[0];
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  expect(options.expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(options.expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

test("JWT contains correct userId and email", async () => {
  await createSession("user-42", "hello@example.com");

  const [, token] = mockSet.mock.calls[0];
  const { payload } = await jwtVerify(token, JWT_SECRET);
  expect(payload.userId).toBe("user-42");
  expect(payload.email).toBe("hello@example.com");
});

test("JWT uses HS256 algorithm", async () => {
  await createSession("user-1", "test@example.com");

  const [, token] = mockSet.mock.calls[0];
  const header = JSON.parse(atob(token.split(".")[0]));
  expect(header.alg).toBe("HS256");
});

// getSession

test("getSession returns null when no cookie is present", async () => {
  mockGet.mockReturnValue(undefined);
  const session = await getSession();
  expect(session).toBeNull();
});

test("getSession returns the session payload for a valid token", async () => {
  const token = await makeToken({ userId: "user-1", email: "test@example.com" });
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();
  expect(session?.userId).toBe("user-1");
  expect(session?.email).toBe("test@example.com");
});

test("getSession returns null for a tampered token", async () => {
  const token = await makeToken({ userId: "user-1", email: "test@example.com" });
  const tampered = token.slice(0, -5) + "XXXXX";
  mockGet.mockReturnValue({ value: tampered });

  const session = await getSession();
  expect(session).toBeNull();
});

test("getSession returns null for an expired token", async () => {
  const token = await makeToken({ userId: "user-1", email: "test@example.com" }, "-1s");
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();
  expect(session).toBeNull();
});
