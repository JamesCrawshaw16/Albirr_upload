import crypto from "node:crypto";

const COOKIE_NAME = "albirr_portal_access";

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left || "");
  const rightBuffer = Buffer.from(right || "");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function expectedToken() {
  const pin = process.env.PORTAL_ACCESS_PIN;
  const secret = process.env.IDMISSION_API_KEY_SECRET;
  if (!pin || !secret) return null;
  return crypto.createHmac("sha256", secret).update(`albirr:${pin}`).digest("hex");
}

function readCookie(request) {
  const cookies = request.headers?.cookie || "";
  const match = cookies.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.slice(COOKIE_NAME.length + 1)) : "";
}

export function isAuthorized(request) {
  const expected = expectedToken();
  return Boolean(expected && safeEqual(readCookie(request), expected));
}

export function pinIsConfigured() {
  return Boolean(process.env.PORTAL_ACCESS_PIN && process.env.IDMISSION_API_KEY_SECRET);
}

export function pinMatches(candidate) {
  return safeEqual(candidate, process.env.PORTAL_ACCESS_PIN);
}

export function accessCookie() {
  const token = expectedToken();
  if (!token) throw new Error("Portal access is not configured");
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
}
