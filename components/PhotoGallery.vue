<script setup lang="ts">
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";
import type { PhotoRecord } from "~/types/models";

const props = defineProps<{
  photos: PhotoRecord[];
}>();

const pb = usePocketbase();

function photoUrl(photo: PhotoRecord) {
  if (!photo.image) {
    return "";
  }

  return pb.files.getURL(photo, photo.image);
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-xl">Photo gallery</CardTitle>
      <CardDescription>Published photos for this cat.</CardDescription>
    </CardHeader>
    <CardContent>
      <p v-if="!photos.length" class="text-sm text-muted-foreground">
        No published photos yet.
      </p>

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <figure
          v-for="photo in photos"
          :key="photo.id"
          class="overflow-hidden rounded-md border border-border"
        >
          <img
            :src="photoUrl(photo)"
            :alt="photo.caption || 'Cat photo'"
            class="block aspect-square w-full object-cover"
          />
          <figcaption class="px-3 py-2 text-sm text-muted-foreground">
            {{ photo.caption || "Untitled" }}
          </figcaption>
        </figure>
      </div>
    </CardContent>
  </Card>
</template>
