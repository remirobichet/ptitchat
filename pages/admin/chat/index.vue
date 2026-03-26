<script setup lang="ts">
import { Button } from "~/components/ui/button";
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

const isSaving = ref(false);
const saveError = ref("");
const saveSuccess = ref("");

const {
  data: cat,
  pending,
  error,
  refresh,
} = await useAsyncData(
  () => `admin-current-cat-${selectedCatId.value || "none"}`,
  async () => {
    if (!selectedCatId.value) {
      return null;
    }

    return pb.collection("cats").getOne<CatRecord>(selectedCatId.value);
  },
  { watch: [selectedCatId] },
);

const initialValues = computed(() => {
  if (!cat.value) {
    return undefined;
  }

  return {
    name: cat.value.name,
    slug: cat.value.slug,
    description: cat.value.description || "",
    published: cat.value.published ?? true,
  };
});

async function onUpdateCat(payload: {
  name: string;
  slug: string;
  description: string;
  published: boolean;
}) {
  if (!selectedCatId.value) {
    return;
  }

  isSaving.value = true;
  saveError.value = "";
  saveSuccess.value = "";

  try {
    await pb.collection("cats").update(selectedCatId.value, payload);
    saveSuccess.value = "Les informations du chat ont été mises à jour.";
    await Promise.all([refresh(), refreshNuxtData("admin-sidebar-cats")]);
  } catch (err) {
    saveError.value =
      err instanceof Error
        ? err.message
        : "Impossible de mettre à jour les informations du chat";
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <section class="grid gap-4">
    <Card v-if="pending">
      <CardContent class="p-4 text-sm text-muted-foreground">
        Chargement du chat...
      </CardContent>
    </Card>

    <Card v-else-if="error">
      <CardContent class="p-4 text-sm text-destructive">
        Erreur : {{ error.message }}
      </CardContent>
    </Card>

    <Card v-else-if="!cat">
      <CardContent class="p-4 text-sm text-muted-foreground">
        Aucun chat sélectionné.
      </CardContent>
    </Card>

    <AdminForm
      v-else
      :is-loading="isSaving"
      :title="`Modifier ${cat.name}`"
      submit-label="Enregistrer les modifications"
      :initial-values="initialValues"
      :reset-on-submit="false"
      @submitted="onUpdateCat"
    />

    <Card v-if="isSaving || saveError || saveSuccess">
      <CardContent class="grid gap-1.5 p-4">
        <p v-if="isSaving" class="text-sm text-muted-foreground">
          Enregistrement...
        </p>
        <p v-if="saveSuccess" class="text-sm text-green-600">
          {{ saveSuccess }}
        </p>
        <p v-if="saveError" class="text-sm text-destructive">{{ saveError }}</p>
      </CardContent>
    </Card>
  </section>
</template>
