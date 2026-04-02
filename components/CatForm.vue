<script setup lang="ts">
import { Button } from "~/components/ui/button";
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";
import { Input } from "~/components/ui/input";
import Label from "~/components/ui/Label.vue";

const props = defineProps<{
  title: string;
  submitLabel: string;
  isLoading?: boolean;
  coverPhotoOptions?: Array<{
    id: string;
    label: string;
    imageUrl: string;
  }>;
  initialValues?: {
    name: string;
    slug: string;
    description: string;
    alsoKnownAs: string;
    birthDate: string;
    published: boolean;
    coverPhoto: string;
  };
  resetOnSubmit?: boolean;
}>();

const emit = defineEmits<{
  submitted: [
    payload: {
      name: string;
      slug: string;
      description: string;
      alsoKnownAs: string;
      birthDate: string | null;
      published: boolean;
      coverPhoto: string | null;
    },
  ];
}>();

const name = ref("");
const slug = ref("");
const description = ref("");
const alsoKnownAs = ref("");
const birthDate = ref("");
const published = ref(true);
const coverPhoto = ref("");

watch(
  () => props.initialValues,
  (value) => {
    name.value = value?.name || "";
    slug.value = value?.slug || "";
    description.value = value?.description || "";
    alsoKnownAs.value = value?.alsoKnownAs || "";
    birthDate.value = value?.birthDate || "";
    published.value = value?.published ?? true;
    coverPhoto.value = value?.coverPhoto || "";
  },
  { immediate: true },
);

function onSubmit() {
  emit("submitted", {
    name: name.value,
    slug: slug.value,
    description: description.value,
    alsoKnownAs: alsoKnownAs.value,
    birthDate: birthDate.value || null,
    published: published.value,
    coverPhoto: coverPhoto.value || null,
  });

  if (props.resetOnSubmit === false) {
    return;
  }

  name.value = "";
  slug.value = "";
  description.value = "";
  alsoKnownAs.value = "";
  birthDate.value = "";
  published.value = true;
  coverPhoto.value = "";
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-xl">{{ props.title }}</CardTitle>
    </CardHeader>

    <CardContent>
      <form class="grid gap-4" @submit.prevent="onSubmit">
        <div class="grid gap-2">
          <Label for="cat-name">Nom</Label>
          <Input
            id="cat-name"
            v-model="name"
            type="text"
            required
            placeholder="Mochi"
          />
        </div>

        <div class="grid gap-2">
          <Label for="cat-slug">Slug</Label>
          <Input
            id="cat-slug"
            v-model="slug"
            type="text"
            required
            placeholder="mochi"
          />
        </div>

        <div class="grid gap-2">
          <Label for="cat-description">Description</Label>
          <textarea
            id="cat-description"
            v-model="description"
            rows="4"
            placeholder="Décrivez ce chat"
            class="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div class="grid gap-2">
          <Label for="cat-also-known-as">Aussi appelé</Label>
          <Input
            id="cat-also-known-as"
            v-model="alsoKnownAs"
            type="text"
            placeholder="Le gros mangeur, Mr papouille, ..."
          />
        </div>

        <div class="grid gap-2">
          <Label for="cat-birth-date">Date de naissance</Label>
          <Input id="cat-birth-date" v-model="birthDate" type="date" />
        </div>

        <label class="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            v-model="published"
            type="checkbox"
            class="h-4 w-4 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          Publié
        </label>

        <div v-if="props.coverPhotoOptions?.length" class="grid gap-2">
          <Label>Image de couverture</Label>
          <div class="grid gap-2">
            <label
              class="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <input
                v-model="coverPhoto"
                type="radio"
                value=""
                class="h-4 w-4"
              />
              Aucune image de couverture
            </label>

            <label
              v-for="option in props.coverPhotoOptions"
              :key="option.id"
              class="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
            >
              <input
                v-model="coverPhoto"
                type="radio"
                :value="option.id"
                class="h-4 w-4"
              />
              <img
                :src="option.imageUrl"
                :alt="option.label"
                class="h-12 w-12 rounded-md border border-border object-cover"
              />
              <span class="text-sm text-muted-foreground">{{
                option.label
              }}</span>
            </label>
          </div>
        </div>

        <Button type="submit" :disabled="props.isLoading">
          {{ props.isLoading ? "Enregistrement..." : props.submitLabel }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
