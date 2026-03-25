<script setup lang="ts">
import { Button } from "~/components/ui/button";
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";
import { Input } from "~/components/ui/input";
import Label from "~/components/ui/Label.vue";

const pb = usePocketbase();

const form = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

async function onSubmit() {
  if (form.password !== form.confirmPassword) {
    errorMessage.value = "Passwords do not match.";
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await pb.collection("users").create({
      email: form.email,
      password: form.password,
      passwordConfirm: form.confirmPassword,
      name: form.name,
      emailVisibility: true,
    });

    successMessage.value = "Account created. You can now sign in.";
    form.name = "";
    form.email = "";
    form.password = "";
    form.confirmPassword = "";
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Could not create account";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Card>
    <CardHeader class="space-y-1 text-center">
      <CardTitle>Create an account</CardTitle>
      <CardDescription
        >Enter your information below to create your account</CardDescription
      >
    </CardHeader>

    <CardContent>
      <form class="grid gap-4" @submit.prevent="onSubmit">
        <div class="grid gap-2">
          <Label for="signup-name">Full Name</Label>
          <Input
            id="signup-name"
            v-model="form.name"
            required
            autocomplete="name"
            placeholder="Ada Lovelace"
          />
        </div>

        <div class="grid gap-2">
          <Label for="signup-email">Email</Label>
          <Input
            id="signup-email"
            v-model="form.email"
            required
            type="email"
            autocomplete="email"
            placeholder="name@example.com"
          />
          <p class="text-xs text-muted-foreground">
            We'll use this to contact you. We will not share it.
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="signup-password">Password</Label>
          <Input
            id="signup-password"
            v-model="form.password"
            required
            type="password"
            autocomplete="new-password"
            placeholder="At least 8 characters"
          />
        </div>

        <div class="grid gap-2">
          <Label for="signup-confirm-password">Confirm Password</Label>
          <Input
            id="signup-confirm-password"
            v-model="form.confirmPassword"
            required
            type="password"
            autocomplete="new-password"
            placeholder="Confirm your password"
          />
        </div>

        <p v-if="errorMessage" class="text-sm text-destructive">
          {{ errorMessage }}
        </p>
        <p v-if="successMessage" class="text-sm text-green-600">
          {{ successMessage }}
        </p>

        <Button type="submit" class="w-full" :disabled="loading">
          {{ loading ? "Creating account..." : "Create Account" }}
        </Button>
      </form>

      <p class="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?
        <NuxtLink
          to="/admin/login"
          class="underline underline-offset-4 hover:text-foreground"
          >Sign in</NuxtLink
        >
      </p>
    </CardContent>
  </Card>
</template>
