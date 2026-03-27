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
    errorMessage.value = "Les mots de passe ne correspondent pas.";
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
      verified: false,
    });

    successMessage.value =
      "Compte créé. Un administrateur doit encore valider votre accès.";
    form.name = "";
    form.email = "";
    form.password = "";
    form.confirmPassword = "";
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Impossible de créer le compte";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Card>
    <CardHeader class="space-y-1 text-center">
      <CardTitle>Créer un compte</CardTitle>
      <CardDescription
        >Saisissez vos informations pour créer votre compte</CardDescription
      >
    </CardHeader>

    <CardContent>
      <form class="grid gap-4" @submit.prevent="onSubmit">
        <div class="grid gap-2">
          <Label for="signup-name">Nom complet</Label>
          <Input
            id="signup-name"
            v-model="form.name"
            required
            autocomplete="name"
            placeholder="Ada Lovelace"
          />
        </div>

        <div class="grid gap-2">
          <Label for="signup-email">E-mail</Label>
          <Input
            id="signup-email"
            v-model="form.email"
            required
            type="email"
            autocomplete="email"
            placeholder="name@example.com"
          />
          <p class="text-xs text-muted-foreground">
            Nous utiliserons cette adresse pour vous contacter. Elle ne sera pas
            partagée.
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="signup-password">Mot de passe</Label>
          <Input
            id="signup-password"
            v-model="form.password"
            required
            type="password"
            autocomplete="new-password"
            placeholder="Au moins 8 caractères"
          />
        </div>

        <div class="grid gap-2">
          <Label for="signup-confirm-password">Confirmer le mot de passe</Label>
          <Input
            id="signup-confirm-password"
            v-model="form.confirmPassword"
            required
            type="password"
            autocomplete="new-password"
            placeholder="Confirmez votre mot de passe"
          />
        </div>

        <p v-if="errorMessage" class="text-sm text-destructive">
          {{ errorMessage }}
        </p>
        <p v-if="successMessage" class="text-sm text-green-600">
          {{ successMessage }}
        </p>

        <Button type="submit" class="w-full" :disabled="loading">
          {{ loading ? "Création du compte..." : "Créer le compte" }}
        </Button>
      </form>

      <p class="mt-4 text-center text-sm text-muted-foreground">
        Vous avez déjà un compte ?
        <NuxtLink
          to="/admin/login"
          class="underline underline-offset-4 hover:text-foreground"
          >Se connecter</NuxtLink
        >
      </p>
    </CardContent>
  </Card>
</template>
