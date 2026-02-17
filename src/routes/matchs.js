import { Router } from "express";
import { matches } from "../db/schema.js";
import { db } from "../db/db.js";
import {
  createMatchBodySchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";
import { getMatchStatus } from "../utils/match_status.js";
import { desc } from "drizzle-orm";

export const matchRouter = Router();
matchRouter.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: parsed.error.errors,
    });
  }

  const limit = Math.min(parsed.data.limit ?? 50, 100);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);
    res.status(200).json({ message: "Matches List", limit, data });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to retrieve matches", details: err.message });
  }
});

matchRouter.post("/", async (req, res) => {
  const parsed = createMatchBodySchema.safeParse(req.body);
  const {
    data: { startTime, endTime, homeScore, awayScore },
  } = parsed;
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid request body", details: parsed.error.errors });
  }

  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime),
      })
      .returning();

    if (res.app.locals.boardcastMatchCreated) {
      res.app.locals.boardcastMatchCreated(event);
    }

    res
      .status(201)
      .json({ message: "Match created successfully", data: event });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create match", details: err.message });
  }
});
