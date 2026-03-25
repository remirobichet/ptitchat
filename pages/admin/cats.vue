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
const formKey = ref(0);
const isCreating = ref(false);
const createError = ref("");
const createSuccess = ref("");

const {
  data: cats,
  pending,
  error,
  refresh,
} = await useAsyncData("admin-cats", async () => {
  const page = await pb
    .collection("cats")
    .getList<CatRecord>(1, 50, { sort: "-created" });
  return page.items;
});

async function onCreateCat(payload: {
  name: string;
  slug: string;
  description: string;
  published: boolean;
}) {
  isCreating.value = true;
  createError.value = "";
  createSuccess.value = "";

  try {
    await pb.collection("cats").create({
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      published: payload.published,
    });

    createSuccess.value = "Cat created successfully.";
    formKey.value += 1;
    await refresh();
  } catch (err) {
    createError.value =
      err instanceof Error ? err.message : "Could not create cat";
  } finally {
    isCreating.value = false;
  }
}
</script>

<template>
  <section class="grid gap-4">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle class="text-2xl">Manage Cats</CardTitle>
          <CardDescription>Create and review cat profiles.</CardDescription>
        </div>
        <Button variant="outline" type="button" @click="refresh"
          >Refresh</Button
        >
      </CardHeader>
    </Card>

    <AdminForm
      :key="formKey"
      :is-loading="isCreating"
      title="Create Cat"
      submit-label="Save Cat"
      @submitted="onCreateCat"
    />

    <Card v-if="isCreating || createError || createSuccess">
      <CardContent class="grid gap-1.5 p-4">
        <p v-if="isCreating" class="text-sm text-muted-foreground">
          Creating cat...
        </p>
        <p v-if="createSuccess" class="text-sm text-green-600">
          {{ createSuccess }}
        </p>
        <p v-if="createError" class="text-sm text-destructive">
          {{ createError }}
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Latest entries</CardTitle>
      </CardHeader>
      <CardContent>
        <p v-if="pending" class="text-sm text-muted-foreground">
          Loading cats...
        </p>
        <p v-else-if="error" class="text-sm text-destructive">
          Error: {{ error.message }}
        </p>
        <ul v-else class="grid gap-2">
          <li
            v-for="cat in cats"
            :key="cat.id"
            class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card p-3"
          >
            <div>
              <p class="text-sm font-medium">{{ cat.name }}</p>
              <p class="text-xs text-muted-foreground">/{{ cat.slug }}</p>
            </div>
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              :class="
                cat.published
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              "
            >
              {{ cat.published ? "Published" : "Draft" }}
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  </section>
</template>
