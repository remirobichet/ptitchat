<script setup lang="ts">
import { Camera, Cat, Link } from "lucide-vue-next";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import type { CatRecord } from "~/types/models";

const props = defineProps<{
  cats: CatRecord[];
  selectedCatId: string | null;
}>();

const navItems = [
  {
    title: "Mon chat",
    url: "/admin/chat",
    icon: Cat,
  },
  {
    title: "Photos",
    url: "/admin/photos",
    icon: Camera,
  },
];

const route = useRoute();
const hasCopiedPublicLink = ref(false);

let resetCopyStateTimeout: ReturnType<typeof setTimeout> | null = null;

const activeCat = computed(() => {
  if (!props.cats.length) {
    return null;
  }

  return (
    props.cats.find((cat) => cat.id === props.selectedCatId) ||
    props.cats[0] ||
    null
  );
});

const publicPath = computed(() => {
  if (!activeCat.value?.slug) {
    return "";
  }

  return `/cats/${activeCat.value.slug}`;
});

function isActive(path: string): boolean {
  if (path === "/admin") {
    return route.path === path;
  }

  return route.path === path || route.path.startsWith(`${path}/`);
}

async function copyPublicLink() {
  if (!import.meta.client || !publicPath.value || !window.location.origin) {
    return;
  }

  try {
    const publicUrl = new URL(
      publicPath.value,
      window.location.origin,
    ).toString();
    await navigator.clipboard.writeText(publicUrl);

    hasCopiedPublicLink.value = true;
    if (resetCopyStateTimeout) {
      clearTimeout(resetCopyStateTimeout);
    }

    resetCopyStateTimeout = setTimeout(() => {
      hasCopiedPublicLink.value = false;
    }, 2000);
  } catch {
    hasCopiedPublicLink.value = false;
  }
}

onBeforeUnmount(() => {
  if (resetCopyStateTimeout) {
    clearTimeout(resetCopyStateTimeout);
  }
});
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem v-for="item in navItems" :key="item.title">
          <SidebarMenuButton
            :is-active="isActive(item.url)"
            as-child
            :tooltip="item.title"
          >
            <NuxtLink :to="item.url">
              <component :is="item.icon" />
              <span>{{ item.title }}</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>

  <SidebarGroup>
    <SidebarGroupLabel>Liens</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            :disabled="!publicPath"
            :tooltip="
              publicPath ? 'Copier le lien public' : 'Aucun chat sélectionné'
            "
            @click="copyPublicLink"
          >
            <Link />
            <span>{{
              hasCopiedPublicLink ? "Lien copié" : "Copier le lien public"
            }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
