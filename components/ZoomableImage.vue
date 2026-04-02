<script setup lang="ts">
import { X } from "lucide-vue-next";
import type { HTMLAttributes } from "vue";
import { cn } from "~/lib/utils";

const props = defineProps<{
  src: string;
  alt: string;
  caption?: string;
  imgClass?: HTMLAttributes["class"];
  buttonClass?: HTMLAttributes["class"];
  overlayClass?: HTMLAttributes["class"];
}>();

const isOpen = ref(false);

function openImage() {
  if (!props.src) {
    return;
  }

  isOpen.value = true;
}

function closeImage() {
  isOpen.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeImage();
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);

  if (import.meta.client) {
    document.body.style.overflow = "";
  }
});

watch(isOpen, (open) => {
  if (!import.meta.client) {
    return;
  }

  document.body.style.overflow = open ? "hidden" : "";
});
</script>

<template>
  <button
    type="button"
    :class="
      cn(
        'block w-full cursor-zoom-in overflow-hidden text-left',
        props.buttonClass,
      )
    "
    @click="openImage"
  >
    <img :src="props.src" :alt="props.alt" :class="props.imgClass" />
  </button>

  <Teleport to="body">
    <div
      v-if="isOpen"
      :class="
        cn(
          'fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-6',
          props.overlayClass,
        )
      "
      @click="closeImage"
    >
      <button
        type="button"
        class="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        aria-label="Fermer l'image"
        @click.stop="closeImage"
      >
        <X class="h-5 w-5" />
      </button>

      <figure class="max-h-full max-w-full" @click.stop>
        <img
          :src="props.src"
          :alt="props.alt"
          class="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
        />
        <figcaption
          v-if="props.caption"
          class="mx-auto mt-4 max-w-3xl text-center text-sm font-medium text-white/85"
        >
          {{ props.caption }}
        </figcaption>
      </figure>
    </div>
  </Teleport>
</template>
