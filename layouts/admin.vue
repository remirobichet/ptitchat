<script setup lang="ts">
import { ClientResponseError } from "pocketbase";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import type { CatRecord } from "~/types/models";

const pb = usePocketbase();
const route = useRoute();
const auth = useAuth();

const selectedCatId = useState<string | null>("admin-selected-cat", () => null);

const { data: cats } = await useAsyncData("admin-sidebar-cats", async () => {
  try {
    const page = await pb
      .collection("cats")
      .getList<CatRecord>(1, 100, { sort: "+name" });
    return page.items;
  } catch (error) {
    if (
      error instanceof ClientResponseError &&
      [401, 403].includes(error.status)
    ) {
      return null;
    }

    throw error;
  }
});

if (cats.value === null) {
  console.log(
    "[layouts/admin] cats fetch returned null, redirecting to login",
    {
      side: import.meta.server ? "server" : "client",
      user: auth.user.value,
    },
  );
  auth.logout();
  await navigateTo("/admin/login", { replace: true });
}

const userEmail = computed(() => auth.user.value?.email || "admin@ptitchat");

watch(
  () => cats.value,
  (value) => {
    if (!selectedCatId.value && value?.length) {
      selectedCatId.value = value[0].id;
    }
  },
  { immediate: true },
);

const selectedCatName = computed(() => {
  if (!cats.value?.length) {
    return null;
  }

  return (
    cats.value.find((cat) => cat.id === selectedCatId.value)?.name ||
    cats.value[0]?.name ||
    null
  );
});

const hasCats = computed(() => Boolean(cats.value?.length));

const currentPageLabel = computed(() => {
  if (route.path.startsWith("/admin/chat/new")) {
    return "Nouveau chat";
  }
  if (route.path.startsWith("/admin/chat")) {
    return "Mon chat";
  }
  if (route.path.startsWith("/admin/photos")) {
    return "Photos";
  }
  if (route.path.startsWith("/admin/storytelling")) {
    return "Storytelling";
  }

  return "Administration";
});

watch(
  () => [hasCats.value, route.path],
  async ([hasAnyCats, path]) => {
    console.log("[layouts/admin] watch route/cats", {
      hasAnyCats,
      path,
      selectedCatId: selectedCatId.value,
    });

    if (!hasAnyCats && path !== "/admin" && path !== "/admin/chat/new") {
      console.log("[layouts/admin] redirecting to /admin/chat/new");
      await navigateTo("/admin/chat/new");
    }
  },
  { immediate: true },
);

async function onLogout() {
  console.log("[layouts/admin] onLogout");
  auth.logout();
  await navigateTo("/admin/login");
}
</script>

<template>
  <ClientOnly>
    <SidebarProvider>
      <AppSidebar
        :cats="cats || []"
        :selected-cat-id="selectedCatId"
        :user-email="userEmail"
        @update:selected-cat-id="selectedCatId = $event"
        @logout="onLogout"
      />

      <SidebarInset>
        <header
          class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
        >
          <div class="flex items-center gap-2 px-4">
            <SidebarTrigger class="-ml-1" />
            <Separator
              orientation="vertical"
              class="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem class="hidden md:block">
                  <span class="text-muted-foreground">
                    {{ selectedCatName || "Administration" }}
                  </span>
                </BreadcrumbItem>
                <BreadcrumbSeparator class="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{{ currentPageLabel }}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div class="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-0">
          <slot />
        </div>
      </SidebarInset>
    </SidebarProvider>

    <template #fallback>
      <div class="flex min-h-svh flex-col gap-4 p-4 md:p-6">
        <div class="h-16 rounded-lg border bg-card" />
        <div class="flex-1 rounded-lg border bg-card" />
      </div>
    </template>
  </ClientOnly>
</template>
