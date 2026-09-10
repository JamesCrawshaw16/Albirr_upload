const SESSION_URL =
  "https://portal-api.idmission.com/portal.sessions.v1.SessionsService/CreateSession";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKeyId = process.env.IDMISSION_API_KEY_ID;
    const apiKeySecret = process.env.IDMISSION_API_KEY_SECRET;

    if (!apiKeyId || !apiKeySecret) {
      return response.status(500).json({ error: "The upload portal is not configured." });
    }

    const sessionResponse = await fetch(SESSION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key_id: apiKeyId,
        api_key_secret: apiKeySecret,
      }),
    });

    const payload = await sessionResponse.json().catch(() => ({}));
    if (!sessionResponse.ok) {
      console.error("IDMission CreateSession failed", sessionResponse.status);
      return response.status(502).json({ error: "A document session could not be started." });
    }

    const sessionId = payload?.session?.id || payload?.id;
    if (!sessionId) {
      console.error("IDMission CreateSession returned no session ID");
      return response.status(502).json({ error: "A document session could not be started." });
    }

    response.setHeader("Cache-Control", "no-store");
    return response.status(200).json({ id: sessionId });
  } catch (error) {
    console.error("Unable to create IDMission session", error);
    return response.status(500).json({ error: "A document session could not be started." });
  }
}
