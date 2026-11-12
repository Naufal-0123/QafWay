import { ref, watch } from "vue";

const KEY = "equran:theme";
export const THEMES = [
  { value: "auto", label: "Otomatis" },
  { value: "light", label: "Terang" },
  { value: "dark", label: "Gelap" },
  { value: "sepia", label: "Sepia" },
];

function read() {
  try {
    const v = localStorage.getItem(KEY);
    if (THEMES.some((t) => t.value === v)) return v;
  } catch {
    /* abaikan */
  }
  return "auto";
}

function apply(v) {
  const el = document.documentElement;
  if (v === "auto") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", v);
}

export const theme = ref(read());
apply(theme.value); // langsung diterapkan saat modul dimuat, sebelum tampilan dirender

watch(theme, (v) => {
  apply(v);
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* penyimpanan tidak tersedia */
  }
});
