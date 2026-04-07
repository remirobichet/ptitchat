<script setup lang="ts">
const auth = useAuth();

watch(
  () => auth.canAccessAdmin.value,
  (canAccessAdmin) => {
    console.log("[pages/admin/login] watch canAccessAdmin", {
      side: import.meta.server ? "server" : "client",
      canAccessAdmin,
      user: auth.user.value,
    });

    if (!canAccessAdmin) {
      return;
    }

    if (import.meta.client) {
      console.log("[pages/admin/login] redirect client -> /admin");
      window.location.replace("/admin");
      return;
    }

    console.log("[pages/admin/login] redirect server -> /admin");
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
