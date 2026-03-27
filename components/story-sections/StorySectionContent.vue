<script setup lang="ts">
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";
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
      <CardDescription
        v-if="props.section.text"
        class="whitespace-pre-line text-base leading-relaxed text-foreground/90"
      >
        {{ props.section.text }}
      </CardDescription>
    </CardHeader>

    <CardContent
      v-if="props.photos.length"
      class="grid gap-3 p-5 sm:grid-cols-2 md:p-6"
      :class="props.section.title || props.section.text ? 'pt-4 md:pt-4' : ''"
    >
      <img
        v-for="photo in props.photos"
        :key="photo.id"
        :src="props.photoUrl(photo)"
        :alt="photo.caption || props.section.title || 'Photo du chat'"
        class="h-56 w-full rounded-md object-cover"
      />
    </CardContent>
  </div>
</template>
