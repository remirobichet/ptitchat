<script setup lang="ts">
import type { Component } from "vue";
import Card from "~/components/ui/Card.vue";
import StorySectionContent from "~/components/story-sections/StorySectionContent.vue";
import StorySectionGallery from "~/components/story-sections/StorySectionGallery.vue";
import StorySectionHero from "~/components/story-sections/StorySectionHero.vue";
import type {
  PhotoRecord,
  StorySectionRecord,
  StorySectionType,
} from "~/types/models";

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

const sectionComponentByType: Record<StorySectionType, Component> = {
  hero: StorySectionHero,
  gallery: StorySectionGallery,
  content: StorySectionContent,
};

function sectionPhotos(section: StorySectionRecord): PhotoRecord[] {
  return toPhotoIds(section.photos)
    .map((photoId) => photoById.value.get(photoId))
    .filter((photo): photo is PhotoRecord => Boolean(photo));
}

function sectionComponent(type: StorySectionType): Component {
  return sectionComponentByType[type] ?? StorySectionContent;
}
</script>

<template>
  <section class="grid gap-5">
    <Card
      v-for="section in props.sections"
      :key="section.id"
      class="overflow-hidden"
    >
      <component
        :is="sectionComponent(section.type)"
        :section="section"
        :photos="sectionPhotos(section)"
        :photo-url="photoUrl"
      />
    </Card>
  </section>
</template>
