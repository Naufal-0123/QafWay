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

export default createRouter({
  history: createWebHistory(),
  routes: [
    // Menu Utama di Navbar
    { path: "/", name: "surah-list", component: SurahList },
    {
      path: "/surah/:nomor(\\d+)",
      name: "surah-detail",
      component: SurahDetail,
    },
    { path: "/kalender", name: "kalender", component: HijriCalendar }, // Sudah termasuk Puasa Sunnah
    { path: "/jadwal-sholat", name: "jadwal-sholat", component: PrayerTimes },
    { path: "/doa", name: "doa", component: DoaList },

    // Sub-halaman Detail
    {
      path: "/surah/:nomor(\\d+)/tafsir",
      name: "tafsir",
      component: TafsirView,
    },
   
    // Menu "Lainnya" & Fitur Pendukung di dalam Menu Lainnya
    { path: "/menu", name: "menu", component: MenuView },
    { path: "/kiblat", name: "kiblat", component: QiblaView },
    { path: "/tilawah", name: "tilawah", component: TilawahView },
    { path: "/dzikir", name: "dzikir", component: DzikirView },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
