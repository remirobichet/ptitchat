<script setup lang="ts">
import { Button } from "~/components/ui/button";
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";
import { Input } from "~/components/ui/input";
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
      error instanceof Error ? error.message : "Connexion impossible";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Card>
    <CardHeader class="space-y-1 text-center">
      <CardTitle>Connexion</CardTitle>
      <CardDescription
        >Saisissez votre e-mail pour accéder à l'administration</CardDescription
      >
    </CardHeader>

    <CardContent>
      <form class="grid gap-4" @submit.prevent="onSubmit">
        <div class="grid gap-2">
          <Label for="login-email">E-mail</Label>
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
          <Label for="login-password">Mot de passe</Label>
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
          {{ loading ? "Connexion..." : "Se connecter" }}
        </Button>
      </form>

      <p class="mt-4 text-center text-sm text-muted-foreground">
        Vous n'avez pas de compte ?
        <NuxtLink
          to="/admin/signup"
          class="underline underline-offset-4 hover:text-foreground"
          >Créer un compte</NuxtLink
        >
      </p>
    </CardContent>
  </Card>
</template>
