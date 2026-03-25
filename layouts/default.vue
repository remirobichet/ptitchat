<template>
  <div class="min-h-svh bg-background">
    <header
      class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <nav class="container flex h-16 items-center justify-between">
        <NuxtLink to="/" class="text-lg font-semibold tracking-tight"
          >PtitChat</NuxtLink
        >
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/"
            class="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Galerie
          </NuxtLink>
          <NuxtLink
            to="/admin/login"
            class="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Connexion admin
          </NuxtLink>
        </div>
      </nav>
    </header>

    <slot />
  </div>
</template>
