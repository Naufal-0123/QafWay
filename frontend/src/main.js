import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/main.css";

createApp(App).use(router).mount("#app");

// Aplikasi berhasil dimuat: reset penanda pemulihan otomatis (lihat index.html)
try {
  sessionStorage.removeItem("qafway-recovered");
} catch (e) {
  /* abaikan */
}
