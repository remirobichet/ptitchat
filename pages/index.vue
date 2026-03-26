<script setup lang="ts">
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";
import type { CatRecord, PhotoRecord } from "~/types/models";

const pb = usePocketbase();
const runtimeConfig = useRuntimeConfig();

const hostname = import.meta.server
  ? (useRequestHeaders(["host"]).host ?? "")
  : window.location.host;

const catSlug = extractCatSlugFromHostname(
  hostname,
  runtimeConfig.public.baseDomain,
);

if (!catSlug) {
  await navigateTo("/admin/login");
}

function escapeFilterValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const {
  data: cat,
  pending: catPending,
  error: catError,
} = await useAsyncData(
  () => `public-cat-${catSlug || "none"}`,
  async () => {
    if (!catSlug) {
      return null;
    }

    try {
      return await pb
        .collection("cats")
        .getFirstListItem<CatRecord>(
          `slug = "${escapeFilterValue(catSlug)}" && published = true`,
        );
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        Number(error.status) === 404
      ) {
        return null;
      }

      throw error;
    }
  },
);

const {
  data: photos,
  pending: photosPending,
  error: photosError,
} = await useAsyncData(
  () => `public-photos-${cat.value?.id || "none"}`,
  async () => {
    if (!cat.value) {
      return [] as PhotoRecord[];
    }

    return pb.collection("photos").getFullList<PhotoRecord>({
      sort: "-created",
      filter: `cat = "${escapeFilterValue(cat.value.id)}"`,
    });
  },
  { watch: [cat] },
);

const coverUrl = computed(() => {
  if (!cat.value?.coverImage) {
    return "";
  }

  return pb.files.getURL(cat.value, cat.value.coverImage);
});

useHead(() => ({
  title: cat.value?.name ? `${cat.value.name} | PtitChat` : "PtitChat",
  meta: [
    {
      name: "description",
      content:
        cat.value?.description ||
        "Découvrez les photos et informations de ce chat.",
    },
  ],
}));
</script>

<template>
  <main class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:py-10">
    <Card v-if="catPending">
      <CardContent class="p-5 text-sm text-muted-foreground">
        Chargement du profil du chat...
      </CardContent>
    </Card>

    <Card v-else-if="catError">
      <CardContent class="p-5 text-sm text-destructive">
        Erreur : {{ catError.message }}
      </CardContent>
    </Card>

    <Card v-else-if="!cat">
      <CardHeader>
        <CardTitle class="text-xl">Chat introuvable</CardTitle>
        <CardDescription>
          Aucun chat publié ne correspond à ce sous-domaine.
        </CardDescription>
      </CardHeader>
    </Card>

    <template v-else>
      <Card class="overflow-hidden">
        <img
          v-if="coverUrl"
          :src="coverUrl"
          :alt="cat.name"
          class="h-56 w-full object-cover md:h-72"
        />
        <CardHeader>
          <CardTitle class="text-2xl">{{ cat.name }}</CardTitle>
          <CardDescription>
            {{ cat.description || "Bienvenue sur la page de ce chat." }}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card v-if="photosPending">
        <CardContent class="p-5 text-sm text-muted-foreground">
          Chargement des photos...
        </CardContent>
      </Card>

      <Card v-else-if="photosError">
        <CardContent class="p-5 text-sm text-destructive">
          Erreur : {{ photosError.message }}
        </CardContent>
      </Card>

      <PhotoGallery v-else :photos="photos || []" />
    </template>
  </main>
</template>
