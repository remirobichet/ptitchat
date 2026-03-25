<script setup lang="ts">
import Button from "~/components/ui/Button.vue";
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";

type AdminNavItem = {
  label: string;
  to: string;
};

const route = useRoute();
const auth = useAuth();

const mobileMenuOpen = ref(false);
const userMenuOpen = ref(false);

const navItems: AdminNavItem[] = [
  { label: "Overview", to: "/admin" },
  { label: "Cats", to: "/admin/cats" },
  { label: "Photos", to: "/admin/photos" },
];

const userEmail = computed(() => auth.user.value?.email || "admin@ptitchat");
const userInitial = computed(() => userEmail.value.charAt(0).toUpperCase());

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false;
    userMenuOpen.value = false;
  },
);

function isActive(path: string): boolean {
  if (path === "/admin") {
    return route.path === path;
  }

  return route.path === path || route.path.startsWith(`${path}/`);
}

async function onLogout() {
  auth.logout();
  await navigateTo("/admin/login");
}
</script>

<template>
  <div class="min-h-svh bg-muted/20">
    <header
      class="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div class="container flex h-16 items-center justify-between gap-4">
        <div class="flex items-center gap-6">
          <NuxtLink to="/admin" class="text-base font-semibold tracking-tight"
            >PtitChat Admin</NuxtLink
          >

          <nav class="hidden items-center gap-1 md:flex">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="rounded-md px-3 py-2 text-sm transition-colors"
              :class="
                isActive(item.to)
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              "
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink
            to="/"
            class="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
          >
            View public site
          </NuxtLink>

          <div class="relative">
            <Button
              variant="outline"
              size="sm"
              class="gap-2"
              @click="userMenuOpen = !userMenuOpen"
            >
              <span
                class="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground"
              >
                {{ userInitial }}
              </span>
              <span class="hidden max-w-32 truncate text-xs sm:inline">{{
                userEmail
              }}</span>
            </Button>

            <Card
              v-if="userMenuOpen"
              class="absolute right-0 top-11 w-56 border shadow-md"
            >
              <CardContent class="space-y-3 p-3">
                <div>
                  <p class="text-xs font-medium text-foreground">
                    Signed in as
                  </p>
                  <p class="truncate text-xs text-muted-foreground">
                    {{ userEmail }}
                  </p>
                </div>
                <div class="grid gap-1">
                  <NuxtLink
                    to="/"
                    class="rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Public Gallery
                  </NuxtLink>
                  <button
                    type="button"
                    class="rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    @click="onLogout"
                  >
                    Logout
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button
            variant="outline"
            size="sm"
            class="md:hidden"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            Menu
          </Button>
        </div>
      </div>

      <div v-if="mobileMenuOpen" class="border-t bg-background md:hidden">
        <nav class="container grid gap-1 py-3">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="rounded-md px-3 py-2 text-sm transition-colors"
            :class="
              isActive(item.to)
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            "
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="container py-6 md:py-8">
      <slot />
    </main>
  </div>
</template>
