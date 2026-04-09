<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "~/lib/utils";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    inline?: boolean;
  }>(),
  {
    inline: false,
  },
);

const runtimeConfig = useRuntimeConfig();

const deploymentVersion = computed(
  () => runtimeConfig.public.deploymentVersion || "dev",
);
</script>

<template>
  <div
    :class="
      cn(
        props.inline
          ? 'text-xs text-sidebar-foreground/60'
          : 'pointer-events-none fixed bottom-3 right-3 z-50',
        props.class,
      )
    "
  >
    <div
      :class="
        props.inline
          ? 'px-2'
          : 'rounded-full border border-border/70 bg-background/85 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur'
      "
    >
      Version {{ deploymentVersion }}
    </div>
  </div>
</template>
