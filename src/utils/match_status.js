import { MATCH_STATUS } from "../validation/matches.js";

export function getMatchStatus(
  startTime,
  endTime,
  isCanceled = false,
  now = new Date(),
) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Invalid date format");
  }

  if (isCanceled) {
    return MATCH_STATUS.CANCELED;
  }

  if (now < start) {
    return MATCH_STATUS.SCHEDULED;
  }

  if (now >= end) {
    return MATCH_STATUS.FINISHED;
  }

  return MATCH_STATUS.LIVE;
}

export async function syncMatchSchema(match, updateStatus) {
  const nextStatus = getMatchStatus(
    match.startTime,
    match.endTime,
    match.isCanceled,
  );
  if (nextStatus !== match.status) {
    try {
      await updateStatus(nextStatus);
      match.status = nextStatus;
    } catch (err) {
      console.error("Failed to update match status", err);
    }
  }
  return match.status;
}
