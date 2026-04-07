<script setup lang="ts">
const auth = useAuth();

if (import.meta.client) {
  watch(
    () => auth.canAccessAdmin.value,
    async (canAccessAdmin) => {
      if (!canAccessAdmin) {
        return;
      }

      await navigateTo("/admin", { replace: true });
    },
    { immediate: true },
  );
}
</script>

<template>
  <div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-sm">
      <LoginForm />
    </div>
  </div>
</template>
