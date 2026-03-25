<script setup lang="ts">
import Card from "~/components/ui/Card.vue";
import type { CatRecord } from "~/types/models";

const props = defineProps<{
  cat: CatRecord;
}>();

const pb = usePocketbase();

const coverUrl = computed(() => {
  if (!props.cat.coverImage) {
    return "";
  }

  return pb.files.getURL(props.cat, props.cat.coverImage);
});
</script>

<template>
  <Card class="grid gap-3 p-4">
    <img
      v-if="coverUrl"
      :src="coverUrl"
      :alt="cat.name"
      class="h-44 w-full rounded-md object-cover"
    />
    <div class="grid gap-1">
      <h3 class="text-lg font-semibold leading-none tracking-tight">
        {{ cat.name }}
      </h3>
      <p class="text-sm text-muted-foreground">
        {{ cat.description || "No description." }}
      </p>
    </div>
    <NuxtLink
      class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      :to="`/cats/${cat.slug}`"
    >
      View details
    </NuxtLink>
  </Card>
</template>
