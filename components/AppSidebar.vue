<script setup lang="ts">
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
      <NavMain :cats="props.cats" :selected-cat-id="props.selectedCatId" />
    </SidebarContent>

    <SidebarFooter>
      <BuildVersionBadge inline class="group-data-[collapsible=icon]:hidden" />
      <NavUser :email="props.userEmail" @logout="emit('logout')" />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
