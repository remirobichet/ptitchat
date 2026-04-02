<script setup lang="ts">
import type { Component } from "vue";
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
  catName: string;
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
  <section class="relative overflow-hidden px-1 py-8 md:px-2 md:py-10 lg:px-3">
    <div class="relative mb-10 text-center">
      <h2
        class="font-['Playfair_Display'] text-4xl font-bold leading-none text-[#3a2e28] md:text-5xl"
      >
        {{ props.catName }}
      </h2>
    </div>

    <div class="relative space-y-14 md:space-y-16">
      <div
        class="pointer-events-none absolute left-4 top-4 bottom-4 w-px bg-gradient-to-b from-[#f5e6de] via-[#d4836b]/50 to-[#9db09e]/70 md:left-1/2 md:-translate-x-1/2"
      />

      <article
        v-for="(section, index) in props.sections"
        :key="section.id"
        class="relative grid items-start gap-4 md:grid-cols-2"
      >
        <div
          class="pointer-events-none absolute left-4 top-8 h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-[#d4836b] bg-white shadow-[0_0_0_6px_rgba(212,131,107,0.12)] md:left-1/2"
        />

        <div
          class="relative pl-10 md:pl-0"
          :class="
            index % 2 === 0
              ? 'md:col-start-1 md:pr-12 lg:pr-16'
              : 'md:col-start-2 md:pl-12 lg:pl-16'
          "
        >
          <div
            class="relative overflow-hidden rounded-[1.5rem] border border-[#ede5dd] bg-white/95 shadow-[0_4px_28px_rgba(58,46,40,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(58,46,40,0.08)]"
          >
            <div
              class="absolute inset-x-8 top-0 h-[3px] rounded-b-full bg-gradient-to-r from-[#d4836b] to-[#9db09e]"
            />
            <component
              :is="sectionComponent(section.type)"
              :section="section"
              :photos="sectionPhotos(section)"
              :photo-url="photoUrl"
              :cat-name="props.catName"
              :index="index"
            />
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
