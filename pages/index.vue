<script setup lang="ts">
import type { Component } from "vue";
import {
  BookOpenText,
  CalendarDays,
  ChevronDown,
  Heart,
  Images,
} from "lucide-vue-next";
import type {
  CatRecord,
  PhotoRecord,
  StorySectionRecord,
} from "~/types/models";

const pb = usePocketbase();
const runtimeConfig = useRuntimeConfig();

const hostname = import.meta.server
  ? (useRequestHeaders(["host"]).host ?? "")
  : window.location.host;

const catSlug = extractCatSlugFromHostname(
  hostname,
  runtimeConfig.public.baseDomain,
);

if (!catSlug) {
  await navigateTo("/admin/login");
}

function escapeFilterValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const {
  data: cat,
  pending: catPending,
  error: catError,
} = await useAsyncData(
  () => `public-cat-${catSlug || "none"}`,
  async () => {
    if (!catSlug) {
      return null;
    }

    try {
      return await pb
        .collection("cats")
        .getFirstListItem<CatRecord>(
          `slug = "${escapeFilterValue(catSlug)}" && published = true`,
        );
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        Number(error.status) === 404
      ) {
        return null;
      }

      throw error;
    }
  },
);

const {
  data: photos,
  pending: photosPending,
  error: photosError,
} = await useAsyncData(
  () => `public-photos-${cat.value?.id || "none"}`,
  async () => {
    if (!cat.value) {
      return [] as PhotoRecord[];
    }

    return pb.collection("photos").getFullList<PhotoRecord>({
      sort: "-created",
      filter: `cat = "${escapeFilterValue(cat.value.id)}"`,
    });
  },
  { watch: [cat] },
);

const {
  data: storySections,
  pending: storyPending,
  error: storyError,
} = await useAsyncData(
  () => `public-story-sections-${cat.value?.id || "none"}`,
  async () => {
    if (!cat.value) {
      return [] as StorySectionRecord[];
    }

    return pb.collection("story_sections").getFullList<StorySectionRecord>({
      sort: "+order,+created",
      filter: `cat = "${escapeFilterValue(cat.value.id)}" && isVisible = true`,
    });
  },
  { watch: [cat] },
);

const hasStorySections = computed(() => Boolean(storySections.value?.length));

const previewPhotos = computed(() => {
  return (photos.value || [])
    .filter((photo) => Boolean(photo.image))
    .slice(0, 7)
    .map((photo) => ({
      ...photo,
      imageUrl: photo.image ? pb.files.getURL(photo, photo.image) : "",
    }));
});

const storyAnchorPhotos = computed(() => previewPhotos.value.slice(0, 3));

const totalPhotos = computed(() => photos.value?.length || 0);
const totalSections = computed(() => storySections.value?.length || 0);

const catYear = computed(() => {
  if (!cat.value?.created) {
    return null;
  }

  const createdDate = new Date(cat.value.created);

  if (Number.isNaN(createdDate.getTime())) {
    return null;
  }

  return String(createdDate.getFullYear());
});

const coverUrl = computed(() => {
  if (!cat.value?.coverPhoto) {
    const firstPhoto = (photos.value || []).find((photo) =>
      Boolean(photo.image),
    );

    if (!firstPhoto?.image) {
      return "";
    }

    return pb.files.getURL(firstPhoto, firstPhoto.image);
  }

  const photoRecord = (photos.value || []).find(
    (photo) => photo.id === cat.value?.coverPhoto,
  );

  if (photoRecord?.image) {
    return pb.files.getURL(photoRecord, photoRecord.image);
  }

  return "";
});

const heroSummary = computed(() => {
  if (cat.value?.description?.trim()) {
    return cat.value.description.trim();
  }

  return "Un concentré de douceur, de siestes impeccables et de souvenirs à feuilleter.";
});

const heroBadges = computed(() => {
  const badges: Array<{ icon: Component; label: string }> = [];

  if (catYear.value) {
    badges.push({
      icon: CalendarDays,
      label: `Avec nous depuis ${catYear.value}`,
    });
  }

  if (totalPhotos.value > 0) {
    badges.push({
      icon: Images,
      label: `${totalPhotos.value} photo${totalPhotos.value > 1 ? "s" : ""}`,
    });
  }

  if (totalSections.value > 0) {
    badges.push({
      icon: BookOpenText,
      label: `${totalSections.value} chapitre${totalSections.value > 1 ? "s" : ""}`,
    });
  }

  badges.push({
    icon: Heart,
    label: "Beaucoup trop aimé",
  });

  return badges;
});

useHead(() => ({
  title: cat.value?.name ? `${cat.value.name} | PtitChat` : "PtitChat",
  meta: [
    {
      name: "description",
      content:
        cat.value?.description ||
        "Découvrez les photos et informations de ce chat.",
    },
  ],
  link: [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700;800;900&display=swap",
    },
  ],
}));
</script>

<template>
  <main
    class="relative isolate min-h-screen overflow-hidden bg-[#fdf8f3] font-['DM_Sans'] text-[#3a2e28]"
  >
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="absolute right-[-7rem] top-[-6rem] h-[26rem] w-[26rem] rounded-full bg-[#f5e6de]/80 blur-3xl"
      />
      <div
        class="absolute left-[-6rem] top-[42%] h-80 w-80 rounded-full bg-[#e8f0e8]/85 blur-3xl"
      />
      <div
        class="absolute bottom-[6%] right-[-4rem] h-[24rem] w-[24rem] rounded-full bg-[#fde8d8]/90 blur-3xl"
      />
    </div>

    <section
      class="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-3 py-6 md:px-4 md:py-8"
    >
      <div
        v-if="catPending"
        class="rounded-[1.75rem] border border-[#ede5dd] bg-white/80 px-5 py-5 text-sm text-[#8c7b72] shadow-[0_24px_50px_rgba(119,89,71,0.08)] backdrop-blur-md"
      >
        <div>Un coussin est en train d'être installé...</div>
      </div>

      <div
        v-else-if="catError"
        class="rounded-[1.75rem] border border-[#ede5dd] bg-white/80 px-5 py-5 text-sm text-destructive shadow-[0_24px_50px_rgba(119,89,71,0.08)] backdrop-blur-md"
      >
        Erreur : {{ catError.message }}
      </div>

      <div
        v-else-if="!cat"
        class="rounded-[1.75rem] border border-[#ede5dd] bg-white/80 px-5 py-6 shadow-[0_24px_50px_rgba(119,89,71,0.08)] backdrop-blur-md"
      >
        <h1 class="font-['Playfair_Display'] text-2xl font-bold text-[#3a2e28]">
          Chat introuvable
        </h1>
        <p class="mt-2 text-sm text-[#8c7b72]">
          Aucun chat publié ne correspond à ce sous-domaine.
        </p>
      </div>

      <template v-else>
        <header
          class="relative flex min-h-[100svh] flex-col items-center justify-center px-2 py-12 text-center md:px-3"
        >
          <div
            class="relative mb-10 h-[13.5rem] w-[13.5rem] md:h-[21rem] md:w-[21rem]"
          >
            <div
              class="hero-ring absolute inset-[-1.75rem] rounded-full border border-[#ede5dd]"
            />
            <div
              class="hero-ring hero-ring-delayed absolute inset-[-0.875rem] rounded-full border-2 border-[#f5e6de]"
            />

            <figure
              class="hero-float relative h-full w-full overflow-hidden rounded-full border border-white/70 bg-white p-2 shadow-[0_20px_60px_rgba(212,131,107,0.22),0_8px_24px_rgba(58,46,40,0.08)]"
            >
              <ZoomableImage
                v-if="coverUrl"
                :src="coverUrl"
                :alt="cat.name"
                img-class="h-full w-full rounded-full object-cover"
                button-class="h-full w-full rounded-full"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center rounded-full bg-white/80 text-sm text-[#8c7b72]"
              >
                Pas encore de portrait
              </div>
            </figure>
          </div>

          <div class="max-w-4xl animate-[fade-up_0.8s_ease-out_0.3s_both]">
            <h1
              class="font-['Playfair_Display'] text-[clamp(3rem,10vw,6rem)] font-black leading-none tracking-[-0.02em] text-[#3a2e28]"
            >
              {{ cat.name }}
            </h1>
            <p
              class="mx-auto mt-4 max-w-2xl font-['Playfair_Display'] text-lg italic text-[#8c7b72] md:text-2xl"
            >
              {{ heroSummary }}
            </p>
          </div>

          <div
            class="mt-8 flex max-w-4xl flex-wrap justify-center gap-2.5 animate-[fade-up_0.8s_ease-out_0.5s_both]"
          >
            <span
              v-for="badge in heroBadges"
              :key="badge.label"
              class="inline-flex items-center gap-2 rounded-full border border-[#ede5dd] bg-white/90 px-4 py-2 text-sm text-[#8c7b72] shadow-[0_4px_12px_rgba(212,131,107,0.08)] transition hover:-translate-y-0.5 hover:border-[#d4836b] hover:text-[#d4836b]"
            >
              <component :is="badge.icon" class="h-4 w-4 text-[#d4836b]" />
              {{ badge.label }}
            </span>
          </div>

          <div
            v-if="storyAnchorPhotos.length"
            class="mt-8 grid w-full max-w-xl grid-cols-3 gap-3 animate-[fade-up_0.8s_ease-out_0.7s_both]"
          >
            <article
              v-for="(photo, index) in storyAnchorPhotos"
              :key="photo.id"
              class="overflow-hidden rounded-2xl border border-white/70 bg-white/85 p-2 shadow-[0_12px_30px_rgba(120,89,69,0.08)]"
              :class="index === 1 ? 'translate-y-3' : ''"
            >
              <ZoomableImage
                :src="photo.imageUrl"
                :alt="photo.caption || `Photo de ${cat.name}`"
                :caption="photo.caption"
                img-class="h-28 w-full rounded-xl object-cover md:h-36"
              />
            </article>
          </div>
        </header>

        <section
          class="mx-auto w-full max-w-6xl pb-12 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700"
        >
          <div
            v-if="storyPending || photosPending"
            class="rounded-[1.75rem] border border-[#ede5dd] bg-white/80 px-5 py-5 text-sm text-[#8c7b72] shadow-[0_24px_50px_rgba(119,89,71,0.08)] backdrop-blur-md"
          >
            Chargement du storytelling...
          </div>

          <div
            v-else-if="storyError || photosError"
            class="rounded-[1.75rem] border border-[#ede5dd] bg-white/80 px-5 py-5 text-sm text-destructive shadow-[0_24px_50px_rgba(119,89,71,0.08)] backdrop-blur-md"
          >
            Erreur : {{ storyError?.message || photosError?.message }}
          </div>

          <StorySectionRenderer
            v-else-if="hasStorySections"
            :sections="storySections || []"
            :photos="photos || []"
            :cat-name="cat.name"
          />

          <PhotoGallery v-else :photos="photos || []" :cat-name="cat.name" />
        </section>

        <footer class="pb-16 pt-4 text-center text-sm text-[#8c7b72]">
          <div class="mx-auto mb-4 h-0.5 w-10 rounded-full bg-[#ede5dd]" />
          <p class="inline-flex items-center gap-2">
            All paws reserved
            <Heart class="heart-beat h-4 w-4 fill-[#d4836b] text-[#d4836b]" />
          </p>
        </footer>
      </template>
    </section>
  </main>
</template>

<style scoped>
@keyframes hero-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes ring-pulse {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(1);
  }

  50% {
    opacity: 0.15;
    transform: scale(1.04);
  }
}

@keyframes scroll-pulse {
  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.9;
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }

  14% {
    transform: scale(1.2);
  }

  28% {
    transform: scale(1);
  }

  42% {
    transform: scale(1.12);
  }

  56% {
    transform: scale(1);
  }
}

.hero-float {
  animation: hero-float 6s ease-in-out infinite;
}

.hero-ring {
  animation: ring-pulse 4s ease-in-out infinite;
}

.hero-ring-delayed {
  animation-delay: 1s;
}

.scroll-line {
  animation: scroll-pulse 2s ease-in-out infinite;
}

.heart-beat {
  animation: heartbeat 1.5s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .hero-float,
  .hero-ring,
  .scroll-line,
  .heart-beat {
    animation: none;
  }
}
</style>
