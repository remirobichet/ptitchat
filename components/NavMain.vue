<script setup lang="ts">
import type { Component } from "vue";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: Component;
};

const props = defineProps<{
  items: NavItem[];
}>();

const route = useRoute();

function isActive(path: string): boolean {
  if (path === "/admin") {
    return route.path === path;
  }

  return route.path === path || route.path.startsWith(`${path}/`);
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem v-for="item in props.items" :key="item.title">
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
</template>
