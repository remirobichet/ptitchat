<script setup lang="ts">
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import type { PhotoRecord, StorySectionRecord } from "~/types/models";

const props = defineProps<{
  sections: StorySectionRecord[];
  photos: PhotoRecord[];
}>();

const pb = usePocketbase();

function toPhotoIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string" && value) {
    return [value];
  }

  return [];
}

function photoUrl(photo: PhotoRecord): string {
  if (!photo.image) {
    return "";
  }

  return pb.files.getURL(photo, photo.image);
}

const photoById = computed(() => {
  return new Map(props.photos.map((photo) => [photo.id, photo]));
});

function sectionPhotos(section: StorySectionRecord): PhotoRecord[] {
  return toPhotoIds(section.photos)
    .map((photoId) => photoById.value.get(photoId))
    .filter((photo): photo is PhotoRecord => Boolean(photo));
}
</script>

<template>
  <section class="grid gap-5">
    <Card
      v-for="section in props.sections"
      :key="section.id"
      class="overflow-hidden"
    >
      <CardContent class="grid gap-4 p-5 md:p-6">
        <template v-if="section.type === 'hero'">
          <img
            v-if="sectionPhotos(section)[0]?.image"
            :src="photoUrl(sectionPhotos(section)[0])"
            :alt="
              sectionPhotos(section)[0]?.caption ||
              section.title ||
              'Photo du chat'
            "
            class="h-64 w-full rounded-md object-cover md:h-80"
          />
          <div class="grid gap-2">
            <h2 v-if="section.title" class="text-2xl font-semibold md:text-3xl">
              {{ section.title }}
            </h2>
            <p
              v-if="section.text"
              class="whitespace-pre-line text-base text-muted-foreground"
            >
              {{ section.text }}
            </p>
          </div>
        </template>

        <template v-else-if="section.type === 'gallery'">
          <div class="grid gap-2">
            <h2 v-if="section.title" class="text-xl font-semibold">
              {{ section.title }}
            </h2>
            <p
              v-if="section.text"
              class="whitespace-pre-line text-sm text-muted-foreground"
            >
              {{ section.text }}
            </p>
          </div>

          <div
            v-if="sectionPhotos(section).length"
            class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <figure
              v-for="photo in sectionPhotos(section)"
              :key="photo.id"
              class="overflow-hidden rounded-md border border-border"
            >
              <img
                v-if="photo.image"
                :src="photoUrl(photo)"
                :alt="photo.caption || section.title || 'Photo du chat'"
                class="block aspect-square w-full object-cover"
              />
              <figcaption
                v-if="photo.caption"
                class="px-3 py-2 text-xs text-muted-foreground"
              >
                {{ photo.caption }}
              </figcaption>
            </figure>
          </div>
        </template>

        <template v-else>
          <div class="grid gap-2">
            <h2 v-if="section.title" class="text-xl font-semibold">
              {{ section.title }}
            </h2>
            <p
              v-if="section.text"
              class="whitespace-pre-line text-base leading-relaxed text-foreground/90"
            >
              {{ section.text }}
            </p>
          </div>

          <div
            v-if="sectionPhotos(section).length"
            class="grid gap-3 sm:grid-cols-2"
          >
            <img
              v-for="photo in sectionPhotos(section)"
              :key="photo.id"
              :src="photoUrl(photo)"
              :alt="photo.caption || section.title || 'Photo du chat'"
              class="h-56 w-full rounded-md object-cover"
            />
          </div>
        </template>
      </CardContent>
    </Card>
  </section>
</template>
