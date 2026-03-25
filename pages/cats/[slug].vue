<script setup lang="ts">
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";
import type { CatRecord, PhotoRecord } from "~/types/models";

const route = useRoute();
const pb = usePocketbase();

const slug = computed(() => String(route.params.slug || ""));

const { data, pending, error } = await useAsyncData(
  () => `cat-${slug.value}`,
  async () => {
    const cat = await pb
      .collection("cats")
      .getFirstListItem<CatRecord>(`slug = "${slug.value}"`);
    const photos = await pb.collection("photos").getFullList<PhotoRecord>({
      sort: "+order,+created",
      filter: `cat = "${cat.id}" && published = true`,
    });
    return { cat, photos };
  },
);
</script>

<template>
  <main class="container grid gap-4 py-8 md:py-10">
    <NuxtLink
      to="/"
      class="inline-flex w-fit items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      Retour à la galerie
    </NuxtLink>

    <Card v-if="pending">
      <CardContent class="p-4 text-sm text-muted-foreground"
        >Chargement...</CardContent
      >
    </Card>
    <Card v-else-if="error">
      <CardContent class="p-4 text-sm text-destructive"
        >Erreur : {{ error.message }}</CardContent
      >
    </Card>

    <template v-else-if="data">
      <Card>
        <CardHeader>
          <CardTitle class="text-2xl md:text-3xl">{{
            data.cat.name
          }}</CardTitle>
          <CardDescription class="text-base">
            {{ data.cat.description || "Aucune description fournie." }}
          </CardDescription>
        </CardHeader>
      </Card>

      <PhotoGallery :photos="data.photos" />
    </template>
  </main>
</template>
