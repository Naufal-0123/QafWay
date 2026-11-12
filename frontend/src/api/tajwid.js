import { get } from "./client";

export const getTajwid = (nomor) => get(`/surahs/${nomor}/tajwid`);
