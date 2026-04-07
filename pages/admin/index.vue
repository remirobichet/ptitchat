<script setup lang="ts">
import { ClientResponseError } from "pocketbase";

definePageMeta({
  middleware: ["auth"],
  layout: "admin",
});

const pb = usePocketbase();
const selectedCatId = useState<string | null>("admin-selected-cat", () => null);

const { data: cats } = await useAsyncData("admin-index-cats", async () => {
  try {
    const page = await pb.collection("cats").getList(1, 1);
    return page.items;
  } catch (error) {
    if (
      error instanceof ClientResponseError &&
      [401, 403].includes(error.status)
    ) {
      return null;
    }

    throw error;
  }
});

if (cats.value === null) {
  useAuth().logout();
  await navigateTo("/admin/login", { replace: true });
}

if (cats.value?.length) {
  if (!selectedCatId.value) {
    selectedCatId.value = cats.value[0].id;
  }
  await navigateTo("/admin/chat");
} else {
  await navigateTo("/admin/chat/new");
}
</script>

<template>
  <div />
</template>
