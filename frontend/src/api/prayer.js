import { get } from "./client";

export const getProvinces = () => get("/prayer/provinces");
export const getCities = (provinsi) => get("/prayer/cities", { provinsi });
export const getPrayerMonth = (provinsi, kabkota, year, month) =>
  get("/prayer/times", { provinsi, kabkota, year, month });
