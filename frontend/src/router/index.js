import { createRouter, createWebHistory } from "vue-router";

import SurahList from "../views/SurahList.vue";
import SurahDetail from "../views/SurahDetail.vue";
import HijriCalendar from "../views/HijriCalendar.vue";
import PrayerTimes from "../views/PrayerTimes.vue";
import TafsirView from "../views/TafsirView.vue";
import DoaList from "../views/DoaList.vue";
import QiblaView from "../views/QiblaView.vue";
import TilawahView from "../views/TilawahView.vue";
import MenuView from "../views/MenuView.vue";
import DzikirView from "../views/DzikirView.vue";
import ZakatView from "../views/ZakatView.vue";
import AsmaulHusnaView from "../views/AsmaulHusnaView.vue";
import KisahNabiView from "../views/KisahNabiView.vue";
import HaditsView from "../views/HaditsView.vue";

export default createRouter({
  history: createWebHistory(),

  routes: [
    // Menu utama
    {
      path: "/",
      name: "surah-list",
      component: SurahList,
    },

    {
      path: "/surah/:nomor(\\d+)",
      name: "surah-detail",
      component: SurahDetail,
    },

    {
      path: "/kalender",
      name: "kalender",
      component: HijriCalendar,
    },

    {
      path: "/jadwal-sholat",
      name: "jadwal-sholat",
      component: PrayerTimes,
    },

    {
      path: "/doa",
      name: "doa",
      component: DoaList,
    },

    // Sub halaman
    {
      path: "/surah/:nomor(\\d+)/tafsir",
      name: "tafsir",
      component: TafsirView,
    },

    // Menu lainnya
    {
      path: "/menu",
      name: "menu",
      component: MenuView,
    },

    {
      path: "/kiblat",
      name: "kiblat",
      component: QiblaView,
    },

    {
      path: "/tilawah",
      name: "tilawah",
      component: TilawahView,
    },

    {
      path: "/dzikir",
      name: "dzikir",
      component: DzikirView,
    },

    {
      path: "/zakat",
      name: "zakat",
      component: ZakatView,
    },

    {
      path: "/asmaul-husna",
      name: "asmaul-husna",
      component: AsmaulHusnaView,
    },

    // Cerita 25 Nabi dan Rasul
    {
      path: "/kisah-nabi",
      name: "kisah-nabi",
      component: KisahNabiView,
    },

    // Hadits Arbain dan Hadits Populer
    {
      path: "/hadits",
      name: "hadits",
      component: HaditsView,
    },
  ],

  scrollBehavior: () => ({ top: 0 }),
});
