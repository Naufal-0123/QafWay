import { get } from "./client";

export const getDailyAyah = (date) => get("/ayahs/daily", { date });
