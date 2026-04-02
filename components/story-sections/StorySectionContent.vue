<script setup lang="ts">
import type { PhotoRecord, StorySectionRecord } from "~/types/models";

const props = defineProps<{
  section: StorySectionRecord;
  photos: PhotoRecord[];
  photoUrl: (photo: PhotoRecord) => string;
  catName: string;
  index: number;
}>();

const hasSinglePhoto = computed(() => props.photos.length === 1);
</script>

<template>
  <div class="grid gap-5 p-5 md:p-8">
    <div class="rounded-[1.25rem] border border-[#ede5dd] bg-[#fffaf7] p-5">
      <h3
        v-if="props.section.title"
        class="font-['Playfair_Display'] text-[2rem] font-bold leading-none text-[#3a2e28]"
      >
        {{ props.section.title }}
      </h3>
      <p
        v-if="props.section.text"
        class="mt-3 whitespace-pre-line text-[0.95rem] leading-7 text-[#8c7b72] md:text-lg"
      >
        {{ props.section.text }}
      </p>
    </div>

    <div
      v-if="props.photos.length"
      class="grid gap-3"
      :class="hasSinglePhoto ? 'md:grid-cols-1' : 'sm:grid-cols-2'"
    >
      <figure
        v-for="photo in props.photos"
        :key="photo.id"
        class="overflow-hidden rounded-[1rem] border border-[#ede5dd] bg-white p-2 shadow-[0_8px_24px_rgba(58,46,40,0.05)]"
      >
        <ZoomableImage
          :src="props.photoUrl(photo)"
          :alt="
            photo.caption || props.section.title || `Photo de ${props.catName}`
          "
          :caption="photo.caption"
          :img-class="
            hasSinglePhoto
              ? 'w-full rounded-[0.85rem] object-cover transition duration-500 hover:scale-[1.03] h-80 md:h-[26rem]'
              : 'w-full rounded-[0.85rem] object-cover transition duration-500 hover:scale-[1.03] h-56'
          "
        />
        <figcaption
          v-if="photo.caption"
          class="px-2.5 pb-1 pt-3 text-sm font-semibold text-[#8c7b72]"
        >
          {{ photo.caption }}
        </figcaption>
      </figure>
    </div>
  </div>
</template>
