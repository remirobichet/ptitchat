<script setup lang="ts">
import { cn } from "~/lib/utils";

const model = defineModel<string>({ default: "" });

const props = withDefaults(
  defineProps<{
    class?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    autocomplete?: string;
  }>(),
  {
    class: "",
    type: "text",
    placeholder: "",
    required: false,
    disabled: false,
    autocomplete: "off",
  },
);
</script>

<template>
  <input
    v-model="model"
    :type="props.type"
    :placeholder="props.placeholder"
    :required="props.required"
    :disabled="props.disabled"
    :autocomplete="props.autocomplete"
    :class="
      cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  />
</template>
