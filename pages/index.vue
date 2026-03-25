<script setup lang="ts">
import Button from "~/components/ui/Button.vue";
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";
import type { CatRecord } from "~/types/models";

const pb = usePocketbase();

const {
  data: cats,
  pending,
  error,
  refresh,
} = await useAsyncData("public-cats", async () => {
  const items = await pb.collection("cats").getList<CatRecord>(1, 12, {
    sort: "-created",
    filter: "published = true",
  });
  return items.items;
});
</script>

<template>
  <main class="container grid gap-6 py-8 md:py-10">
    <Card>
      <CardHeader class="space-y-3">
        <CardTitle class="text-3xl md:text-4xl">PtitChat</CardTitle>
        <CardDescription class="max-w-2xl text-base">
          Explore the latest published cats and jump into the admin backoffice
          when you need to update content.
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap gap-2">
        <NuxtLink
          class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          to="/admin/login"
        >
          Admin Login
        </NuxtLink>
        <NuxtLink
          class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          to="/admin"
        >
          Admin Dashboard
        </NuxtLink>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0">
        <CardTitle class="text-xl">Latest cats</CardTitle>
        <Button variant="outline" type="button" @click="refresh"
          >Refresh</Button
        >
      </CardHeader>

      <CardContent>
        <p v-if="pending" class="text-sm text-muted-foreground">
          Loading cats...
        </p>
        <p v-else-if="error" class="text-sm text-destructive">
          Could not load cats: {{ error.message }}
        </p>
        <p v-else-if="!cats?.length" class="text-sm text-muted-foreground">
          No published cats yet.
        </p>

        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CatCard v-for="cat in cats" :key="cat.id" :cat="cat" />
        </div>
      </CardContent>
    </Card>
  </main>
</template>
