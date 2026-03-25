<script setup lang="ts">
import { ChevronsUpDown, Plus } from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import type { CatRecord } from "~/types/models";

const props = defineProps<{
  cats: CatRecord[];
  selectedCatId: string | null;
}>();

const emit = defineEmits<{
  "update:selectedCatId": [catId: string];
}>();

const { isMobile } = useSidebar();

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

function selectCat(catId: string) {
  emit("update:selectedCatId", catId);
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div
              class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
            >
              {{ activeCat?.name?.charAt(0).toUpperCase() || "C" }}
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{
                activeCat?.name || "Cats"
              }}</span>
              <span class="truncate text-xs">{{
                activeCat?.slug ? `/${activeCat.slug}` : "No cats yet"
              }}</span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="start"
          :side-offset="4"
        >
          <DropdownMenuLabel class="text-xs text-muted-foreground"
            >Teams</DropdownMenuLabel
          >
          <DropdownMenuItem
            v-for="(cat, index) in props.cats"
            :key="cat.id"
            class="gap-2 p-2"
            @click="selectCat(cat.id)"
          >
            <div
              class="flex size-6 items-center justify-center rounded-sm border"
            >
              {{ cat.name.charAt(0).toUpperCase() }}
            </div>
            {{ cat.name }}
            <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="gap-2 p-2" as-child>
            <NuxtLink to="/admin/cats">
              <div
                class="flex size-6 items-center justify-center rounded-md border bg-background"
              >
                <Plus class="size-4" />
              </div>
              <div class="font-medium text-muted-foreground">Add cat</div>
            </NuxtLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
