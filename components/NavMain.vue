<script setup lang="ts">
import { BookText, Camera, Cat, Link } from "lucide-vue-next";
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
  {
    title: "Storytelling",
    url: "/admin/storytelling",
    icon: BookText,
  },
];

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
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

const publicUrl = computed(() => {
  if (!activeCat.value?.slug) {
    return "";
  }

  if (!import.meta.client) {
    return "";
  }

  return buildCatPublicUrl(
    activeCat.value.slug,
    window.location.host,
    window.location.protocol,
    runtimeConfig.public.baseDomain,
  );
});

const publicLinkTooltip = computed(() => {
  if (!activeCat.value?.slug) {
    return "Aucun chat sélectionné";
  }

  if (!publicUrl.value) {
    return "Configurez NUXT_PUBLIC_BASE_DOMAIN";
  }

  return "Copier le lien public";
});

function isActive(path: string): boolean {
  if (path === "/admin") {
    return route.path === path;
  }

  return route.path === path || route.path.startsWith(`${path}/`);
}

async function copyPublicLink() {
  if (!import.meta.client || !publicUrl.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(publicUrl.value);

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
            :disabled="!publicUrl"
            :tooltip="publicLinkTooltip"
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
