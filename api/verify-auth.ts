import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyToken(token); // your JWT verify function
    if (!decoded || decoded.exp <= Date.now() / 1000) {
      return res.status(401).json({ error: "Invalid token" });
    }
    return res.status(200).json({ valid: true, user: decoded.user });
  } catch {
    return res.status(401).json({ error: "Token verification failed" });
  }
}
