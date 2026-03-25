<script setup lang="ts">
import { Button } from "~/components/ui/button";
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";

definePageMeta({
  middleware: ["auth"],
  layout: "admin",
});

const pb = usePocketbase();

const {
  data: photos,
  pending,
  error,
  refresh,
} = await useAsyncData("admin-photos", async () => {
  return pb.collection("photos").getList(1, 100, {
    sort: "-created",
    expand: "cat",
  });
});
</script>

<template>
  <section class="grid gap-4">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle class="text-2xl">Manage Photos</CardTitle>
          <CardDescription>Review photo publication status.</CardDescription>
        </div>
        <Button variant="outline" type="button" @click="refresh"
          >Refresh</Button
        >
      </CardHeader>
    </Card>

    <Card>
      <CardContent class="p-4">
        <p v-if="pending" class="text-sm text-muted-foreground">
          Loading photos...
        </p>
        <p v-else-if="error" class="text-sm text-destructive">
          Error: {{ error.message }}
        </p>
        <p
          v-else-if="!photos?.items.length"
          class="text-sm text-muted-foreground"
        >
          No photos yet.
        </p>
        <ul v-else class="grid gap-2">
          <li
            v-for="photo in photos.items"
            :key="photo.id"
            class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card p-3"
          >
            <div>
              <p class="text-sm font-medium">
                {{ photo.caption || "Untitled" }}
              </p>
              <p class="text-xs text-muted-foreground">ID: {{ photo.id }}</p>
            </div>
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              :class="
                photo.published
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              "
            >
              {{ photo.published ? "Published" : "Draft" }}
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  </section>
</template>
