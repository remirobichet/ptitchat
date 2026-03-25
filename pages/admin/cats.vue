<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
  layout: "admin",
});

await navigateTo("/admin/chat");
</script>

<template>
  <div />
</template>
