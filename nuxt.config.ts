export default defineNuxtConfig({
  compatibilityDate: "2024-12-01",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  components: [
    {
      path: "~/components",
      extensions: ["vue"],
    },
  ],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    pocketbaseAdminEmail: "",
    pocketbaseAdminPassword: "",
    public: {
      pocketbaseUrl:
        process.env.NUXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090",
    },
  },
});
