import { accessCookie, pinIsConfigured, pinMatches } from "./_auth.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }
  if (!pinIsConfigured()) return response.status(500).json({ error: "Portal access has not been configured." });
  const candidate = typeof request.body?.pin === "string" ? request.body.pin.trim() : "";
  if (!candidate || !pinMatches(candidate)) {
    return response.status(401).json({ error: "That PIN isn’t correct. Please try again." });
  }
  response.setHeader("Set-Cookie", accessCookie());
  response.setHeader("Cache-Control", "no-store");
  return response.status(200).json({ authorized: true });
}
