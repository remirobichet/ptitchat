<script setup lang="ts">
import type { PhotoRecord } from "~/types/models";

const props = defineProps<{
  photos: PhotoRecord[];
  catName: string;
}>();

const pb = usePocketbase();

function photoUrl(photo: PhotoRecord): string {
  if (!photo.image) {
    return "";
  }

  return pb.files.getURL(photo, photo.image);
}

const photoRows = computed(() => {
  const rows: PhotoRecord[][] = [];

  for (let index = 0; index < props.photos.length; index += 3) {
    rows.push(props.photos.slice(index, index + 3));
  }

  return rows;
});
</script>

<template>
  <section class="p-5 md:p-6">
    <div class="max-w-3xl">
      <h2
        class="font-['Playfair_Display'] text-4xl font-bold leading-none text-[#3a2e28] md:text-5xl"
      >
        {{ props.catName }}
      </h2>
      <p class="mt-3 text-sm uppercase tracking-[0.24em] text-[#d4836b]">
        Galerie de souvenirs
      </p>
    </div>

    <div v-if="props.photos.length" class="mt-8 grid gap-4">
      <div
        v-for="(row, rowIndex) in photoRows"
        :key="`row-${rowIndex}`"
        class="grid gap-4 lg:grid-cols-3"
      >
        <figure
          v-for="(photo, photoIndex) in row"
          :key="photo.id"
          class="overflow-hidden rounded-[1.25rem] border border-[#ede5dd] bg-white p-2 shadow-[0_16px_34px_rgba(115,82,63,0.06)] transition duration-200 hover:-translate-y-1"
          :class="photoIndex === 1 ? 'lg:translate-y-6' : ''"
        >
          <ZoomableImage
            :src="photoUrl(photo)"
            :alt="photo.caption || `Photo de ${props.catName}`"
            :caption="photo.caption"
            img-class="block h-72 w-full rounded-[1rem] object-cover transition duration-500 hover:scale-[1.03]"
          />
          <figcaption
            v-if="photo.caption"
            class="px-3 pb-2 pt-3 text-sm font-semibold text-[#8c7b72]"
          >
            {{ photo.caption }}
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
