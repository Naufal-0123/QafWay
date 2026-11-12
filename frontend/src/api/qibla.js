import { get } from "./client";

export const getQibla = (lat, lng) => get("/qibla", { lat, lng });
