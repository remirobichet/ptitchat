<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
  layout: "admin",
});

const pb = usePocketbase();
const selectedCatId = useState<string | null>("admin-selected-cat", () => null);

const { data: cats } = await useAsyncData("admin-index-cats", async () => {
  const page = await pb.collection("cats").getList(1, 1);
  return page.items;
});

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
