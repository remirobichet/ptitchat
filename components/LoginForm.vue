<script setup lang="ts">
import Button from "~/components/ui/Button.vue";
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";
import Input from "~/components/ui/Input.vue";
import Label from "~/components/ui/Label.vue";

const auth = useAuth();

const form = reactive({
  email: "",
  password: "",
});

const loading = ref(false);
const errorMessage = ref("");

async function onSubmit() {
  loading.value = true;
  errorMessage.value = "";

  try {
    await auth.login(form.email, form.password);
    await navigateTo("/admin");
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Could not sign in";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Card>
    <CardHeader class="space-y-1 text-center">
      <CardTitle>Sign in</CardTitle>
      <CardDescription
        >Enter your email below to access your admin dashboard</CardDescription
      >
    </CardHeader>

    <CardContent>
      <form class="grid gap-4" @submit.prevent="onSubmit">
        <div class="grid gap-2">
          <Label for="login-email">Email</Label>
          <Input
            id="login-email"
            v-model="form.email"
            required
            type="email"
            autocomplete="email"
            placeholder="name@example.com"
          />
        </div>

        <div class="grid gap-2">
          <Label for="login-password">Password</Label>
          <Input
            id="login-password"
            v-model="form.password"
            required
            type="password"
            autocomplete="current-password"
          />
        </div>

        <p v-if="errorMessage" class="text-sm text-destructive">
          {{ errorMessage }}
        </p>

        <Button type="submit" class="w-full" :disabled="loading">
          {{ loading ? "Signing in..." : "Sign in" }}
        </Button>
      </form>

      <p class="mt-4 text-center text-sm text-muted-foreground">
        Don't have an account?
        <NuxtLink
          to="/admin/signup"
          class="underline underline-offset-4 hover:text-foreground"
          >Create one</NuxtLink
        >
      </p>
    </CardContent>
  </Card>
</template>
