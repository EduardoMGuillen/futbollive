import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "donde_juega_admin";
const SESSION_SECONDS = 60 * 60 * 12;

function secret() {
  return process.env.AUTH_SECRET || "dev-only-change-this-secret";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function verifyCredentials(username: string, password: string) {
  const expectedUser = process.env.ADMIN_USER || "admin";
  // Env var overrides the default so the panel keeps working even if hosting lacks configuration.
  const expectedPassword = process.env.ADMIN_PASSWORD || "guillendondejugamos";
  if (username.trim().toLowerCase() !== expectedUser.toLowerCase()) return false;
  const received = Buffer.from(password.trim());
  const expected = Buffer.from(expectedPassword);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export function createSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({ role: "admin", exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || sign(payload) !== signature) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp: number };
    return data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(AUTH_COOKIE)?.value);
}
