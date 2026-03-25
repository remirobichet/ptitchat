<script setup lang="ts">
const auth = useAuth();

if (auth.isAuthenticated.value) {
  await navigateTo("/admin");
}
</script>

<template>
  <div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-sm">
      <LoginForm />
    </div>
  </div>
</template>
