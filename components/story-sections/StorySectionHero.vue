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

const firstPhoto = computed(() => props.photos[0]);
</script>

<template>
  <div>
    <CardContent v-if="firstPhoto?.image" class="grid gap-4 p-5 md:p-6">
      <img
        :src="props.photoUrl(firstPhoto)"
        :alt="firstPhoto.caption || props.section.title || 'Photo du chat'"
        class="h-64 w-full rounded-md object-cover md:h-80"
      />
    </CardContent>

    <CardHeader
      v-if="props.section.title || props.section.text"
      class="space-y-2 px-5 pb-5 pt-0 md:px-6 md:pb-6"
    >
      <CardTitle v-if="props.section.title" class="text-2xl md:text-3xl">
        {{ props.section.title }}
      </CardTitle>
      <CardDescription
        v-if="props.section.text"
        class="whitespace-pre-line text-base"
      >
        {{ props.section.text }}
      </CardDescription>
    </CardHeader>
  </div>
</template>
