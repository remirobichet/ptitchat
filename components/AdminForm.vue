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
}>();

const emit = defineEmits<{
  submitted: [
    payload: {
      name: string;
      slug: string;
      description: string;
      published: boolean;
    },
  ];
}>();

const name = ref("");
const slug = ref("");
const description = ref("");
const published = ref(true);

function onSubmit() {
  emit("submitted", {
    name: name.value,
    slug: slug.value,
    description: description.value,
    published: published.value,
  });
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

        <label class="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            v-model="published"
            type="checkbox"
            class="h-4 w-4 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          Publié
        </label>

        <Button type="submit" :disabled="props.isLoading">
          {{ props.isLoading ? "Enregistrement..." : props.submitLabel }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
