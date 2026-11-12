import { get } from "./client";

export const getFastingMonth = (year, month) =>
  get("/fasting/schedule", { year, month });
