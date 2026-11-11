import { createRouter, createWebHistory } from 'vue-router'
import SurahList from '../views/SurahList.vue'
import SurahDetail from '../views/SurahDetail.vue'
import HijriCalendar from '../views/HijriCalendar.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'surah-list', component: SurahList },
    { path: '/surah/:nomor(\\d+)', name: 'surah-detail', component: SurahDetail },
    { path: '/kalender', name: 'kalender', component: HijriCalendar },
  ],
  scrollBehavior: () => ({ top: 0 }),
})