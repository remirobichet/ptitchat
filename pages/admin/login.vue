<script setup lang="ts">
const auth = useAuth();

watch(
  () => auth.isAuthenticated.value,
  (isAuthenticated) => {
    if (!isAuthenticated) {
      return;
    }

    if (import.meta.client) {
      window.location.replace("/admin");
      return;
    }

    navigateTo("/admin", { replace: true });
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-sm">
      <LoginForm />
    </div>
  </div>
</template>
