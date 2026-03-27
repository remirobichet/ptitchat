<script setup lang="ts">
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";
import type { CatRecord } from "~/types/models";

definePageMeta({
  middleware: ["auth"],
  layout: "admin",
});

const pb = usePocketbase();
const selectedCatId = useState<string | null>("admin-selected-cat", () => null);

const isCreating = ref(false);
const createError = ref("");

async function onCreateCat(payload: {
  name: string;
  slug: string;
  description: string;
  published: boolean;
  coverPhoto: string | null;
}) {
  isCreating.value = true;
  createError.value = "";

  try {
    const created = await pb.collection("cats").create<CatRecord>({
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      published: payload.published,
      coverPhoto: payload.coverPhoto || null,
    });

    selectedCatId.value = created.id;
    await refreshNuxtData("admin-sidebar-cats");
    await navigateTo("/admin/chat");
  } catch (err) {
    createError.value =
      err instanceof Error ? err.message : "Impossible de créer le chat";
  } finally {
    isCreating.value = false;
  }
}
</script>

<template>
  <section class="grid gap-4">
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl">Créer un chat</CardTitle>
        <CardDescription>
          Commencez par créer votre premier chat pour accéder à
          l'administration.
        </CardDescription>
      </CardHeader>
    </Card>

    <CatForm
      :is-loading="isCreating"
      title="Nouveau chat"
      submit-label="Créer le chat"
      @submitted="onCreateCat"
    />

    <Card v-if="isCreating || createError">
      <CardContent class="grid gap-1.5 p-4">
        <p v-if="isCreating" class="text-sm text-muted-foreground">
          Création du chat...
        </p>
        <p v-if="createError" class="text-sm text-destructive">
          {{ createError }}
        </p>
      </CardContent>
    </Card>
  </section>
</template>
