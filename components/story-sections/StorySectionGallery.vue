<script setup lang="ts">
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";
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
}>();
</script>

<template>
  <div>
    <CardHeader
      v-if="props.section.title || props.section.text"
      class="space-y-2 p-5 pb-0 md:p-6 md:pb-0"
    >
      <CardTitle v-if="props.section.title" class="text-xl">
        {{ props.section.title }}
      </CardTitle>
      <CardDescription v-if="props.section.text" class="whitespace-pre-line">
        {{ props.section.text }}
      </CardDescription>
    </CardHeader>

    <CardContent
      v-if="props.photos.length"
      class="p-5 md:p-6"
      :class="props.section.title || props.section.text ? 'pt-4 md:pt-4' : ''"
    >
      <Carousel
        class="w-full"
        :opts="{
          align: 'start',
        }"
      >
        <CarouselContent class="-ml-2 md:-ml-4">
          <CarouselItem
            v-for="photo in props.photos"
            :key="photo.id"
            class="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3"
          >
            <figure class="overflow-hidden rounded-md border border-border">
              <img
                v-if="photo.image"
                :src="props.photoUrl(photo)"
                :alt="photo.caption || props.section.title || 'Photo du chat'"
                class="block aspect-square w-full object-cover"
              />
              <figcaption
                v-if="photo.caption"
                class="px-3 py-2 text-xs text-muted-foreground"
              >
                {{ photo.caption }}
              </figcaption>
            </figure>
          </CarouselItem>
        </CarouselContent>

        <CarouselPrevious
          class="left-3 top-1/2 h-9 w-9 -translate-y-1/2 bg-background/90"
        />
        <CarouselNext
          class="right-3 top-1/2 h-9 w-9 -translate-y-1/2 bg-background/90"
        />
      </Carousel>
    </CardContent>
  </div>
</template>
