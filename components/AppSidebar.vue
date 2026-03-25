<script setup lang="ts">
import { Camera, Cat } from "lucide-vue-next";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import type { CatRecord } from "~/types/models";

const props = defineProps<{
  cats: CatRecord[];
  selectedCatId: string | null;
  userEmail: string;
}>();

const emit = defineEmits<{
  "update:selectedCatId": [catId: string];
  logout: [];
}>();

const navMain = [
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
</script>

<template>
  <Sidebar collapsible="icon" variant="inset">
    <SidebarHeader>
      <CatSwitcher
        :cats="props.cats"
        :selected-cat-id="props.selectedCatId"
        @update:selected-cat-id="emit('update:selectedCatId', $event)"
      />
    </SidebarHeader>

    <SidebarContent>
      <NavMain :items="navMain" />
    </SidebarContent>

    <SidebarFooter>
      <NavUser :email="props.userEmail" @logout="emit('logout')" />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
