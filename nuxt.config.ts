import { execSync } from "node:child_process";

const resolveGitCommitHash = () => {
  const commitHash =
    process.env.NUXT_PUBLIC_COMMIT_HASH?.slice(0, 7) ||
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);

  if (commitHash) {
    return commitHash;
  }

  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "dev";
  }
};

const commitHash = resolveGitCommitHash();

export default defineNuxtConfig({
  ssr: false,
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
      baseDomain: process.env.NUXT_PUBLIC_BASE_DOMAIN || "",
      commitHash,
    },
  },
});
