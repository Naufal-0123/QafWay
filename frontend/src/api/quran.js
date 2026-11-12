import { get } from "./client";

export const getSurahs = (q) => get("/surahs", { q });
export const getSurah = (nomor) => get(`/surahs/${nomor}`);
