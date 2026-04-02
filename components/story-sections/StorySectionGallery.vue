<script setup lang="ts">
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import type { PhotoRecord, StorySectionRecord } from "~/types/models";

const props = defineProps<{
  section: StorySectionRecord;
  photos: PhotoRecord[];
  photoUrl: (photo: PhotoRecord) => string;
  catName: string;
  index: number;
}>();
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
      class="rounded-[1.25rem] border border-[#ede5dd] bg-white/80 p-3 shadow-[0_10px_28px_rgba(58,46,40,0.05)]"
    >
      <Carousel
        class="w-full px-10 md:px-12"
        :opts="{
          align: 'start',
          loop: props.photos.length > 1,
        }"
      >
        <CarouselContent class="-ml-2 md:-ml-4">
          <CarouselItem
            v-for="photo in props.photos"
            :key="photo.id"
            class="basis-full pl-2 md:pl-4"
          >
            <figure
              class="overflow-hidden rounded-[1rem] border border-[#ede5dd] bg-white p-2 shadow-[0_8px_24px_rgba(58,46,40,0.05)]"
            >
              <ZoomableImage
                v-if="photo.image"
                :src="props.photoUrl(photo)"
                :alt="
                  photo.caption ||
                  props.section.title ||
                  `Photo de ${props.catName}`
                "
                :caption="photo.caption"
                img-class="block h-72 w-full rounded-[0.85rem] object-cover transition duration-500 hover:scale-[1.02]"
              />
              <figcaption
                v-if="photo.caption"
                class="px-2.5 pb-1 pt-3 text-sm font-semibold text-[#8c7b72]"
              >
                {{ photo.caption }}
              </figcaption>
            </figure>
          </CarouselItem>
        </CarouselContent>

        <CarouselPrevious
          class="left-1 top-1/2 h-10 w-10 -translate-y-1/2 border-[#ede5dd] bg-white/95 text-[#3a2e28] shadow-[0_10px_20px_rgba(120,82,63,0.1)]"
        />
        <CarouselNext
          class="right-1 top-1/2 h-10 w-10 -translate-y-1/2 border-[#ede5dd] bg-white/95 text-[#3a2e28] shadow-[0_10px_20px_rgba(120,82,63,0.1)]"
        />
      </Carousel>
    </div>
  </div>
</template>
