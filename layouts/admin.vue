<script setup lang="ts">
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
  const page = await pb
    .collection("cats")
    .getList<CatRecord>(1, 100, { sort: "+name" });
  return page.items;
});

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

  return "Administration";
});

watch(
  () => [hasCats.value, route.path],
  async ([hasAnyCats, path]) => {
    if (!hasAnyCats && path !== "/admin/chat/new") {
      await navigateTo("/admin/chat/new");
      return;
    }

    if (hasAnyCats && path === "/admin") {
      await navigateTo("/admin/chat");
    }
  },
  { immediate: true },
);

async function onLogout() {
  auth.logout();
  await navigateTo("/admin/login");
}
</script>

<template>
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
</template>
