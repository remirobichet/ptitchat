<script setup lang="ts">
import type { PhotoRecord, StorySectionRecord } from "~/types/models";

const props = defineProps<{
  section: StorySectionRecord;
  photos: PhotoRecord[];
  photoUrl: (photo: PhotoRecord) => string;
  catName: string;
  index: number;
}>();

const firstPhoto = computed(() => props.photos[0]);
</script>

<template>
  <div class="grid gap-5 p-5 md:p-8">
    <figure
      v-if="firstPhoto?.image"
      class="relative overflow-hidden rounded-2xl"
    >
      <img
        :src="props.photoUrl(firstPhoto)"
        :alt="
          firstPhoto.caption ||
          props.section.title ||
          `Photo de ${props.catName}`
        "
        class="h-72 w-full rounded-2xl object-cover transition duration-500 hover:scale-[1.02] md:h-[26rem]"
      />
    </figure>

    <div
      v-if="props.section.title || props.section.text"
      class="rounded-[1.25rem] border border-[#ede5dd] bg-[#fffaf7] px-5 py-5"
    >
      <h3
        v-if="props.section.title"
        class="font-['Playfair_Display'] text-3xl font-bold leading-none text-[#3a2e28]"
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
  </div>
</template>
