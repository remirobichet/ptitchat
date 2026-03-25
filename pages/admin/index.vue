<script setup lang="ts">
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";

definePageMeta({
  middleware: ["auth"],
  layout: "admin",
});
</script>

<template>
  <section class="grid gap-4">
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl">Admin Dashboard</CardTitle>
        <CardDescription
          >Manage cats and published photos from one place.</CardDescription
        >
      </CardHeader>
      <CardContent class="flex flex-wrap gap-2">
        <NuxtLink
          class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          to="/admin/cats"
        >
          Manage Cats
        </NuxtLink>
        <NuxtLink
          class="inline-flex h-9 items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80"
          to="/admin/photos"
        >
          Manage Photos
        </NuxtLink>
        <NuxtLink
          class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          to="/"
        >
          View Public Site
        </NuxtLink>
      </CardContent>
    </Card>
  </section>
</template>
