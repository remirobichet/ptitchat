<script setup lang="ts">
const auth = useAuth();

if (import.meta.client) {
  watch(
    () => auth.canAccessAdmin.value,
    async (canAccessAdmin) => {
      console.log("[pages/admin/login] watch canAccessAdmin", {
        side: "client",
        canAccessAdmin,
        user: auth.user.value,
      });

      if (!canAccessAdmin) {
        return;
      }

      console.log("[pages/admin/login] navigate client -> /admin");
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
