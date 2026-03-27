<script setup lang="ts">
import type { CSSProperties } from "vue";
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";
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
    .slice(0, 6)
    .map((photo) => ({
      ...photo,
      imageUrl: photo.image ? pb.files.getURL(photo, photo.image) : "",
    }));
});

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

const heroPointer = ref({ x: 0, y: 0 });
const reducedMotion = ref(false);

const heroImageStyle = computed<CSSProperties>(() => {
  if (reducedMotion.value) {
    return {
      transform: "translate3d(0, 0, 0)",
    };
  }

  return {
    transform: `translate3d(${heroPointer.value.x * 10}px, ${heroPointer.value.y * 10}px, 0) scale(1.03)`,
  };
});

const orbOneStyle = computed<CSSProperties>(() => ({
  transform: `translate3d(${heroPointer.value.x * -22}px, ${heroPointer.value.y * -14}px, 0)`,
}));

const orbTwoStyle = computed<CSSProperties>(() => ({
  transform: `translate3d(${heroPointer.value.x * 16}px, ${heroPointer.value.y * 20}px, 0)`,
}));

const pawTrailStyle = computed<CSSProperties>(() => ({
  transform: `translate3d(${heroPointer.value.x * -12}px, ${heroPointer.value.y * 10}px, 0)`,
}));

function onHeroPointerMove(event: PointerEvent): void {
  if (reducedMotion.value) {
    return;
  }

  const target = event.currentTarget;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const rect = target.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;

  heroPointer.value = {
    x: Math.max(-1, Math.min(1, x)),
    y: Math.max(-1, Math.min(1, y)),
  };
}

function onHeroPointerLeave(): void {
  heroPointer.value = { x: 0, y: 0 };
}

onMounted(() => {
  reducedMotion.value = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
});

const coverUrl = computed(() => {
  if (!cat.value?.coverPhoto) {
    return "";
  }

  const photoRecord = (photos.value || []).find(
    (photo) => photo.id === cat.value?.coverPhoto,
  );

  if (photoRecord?.image) {
    return pb.files.getURL(photoRecord, photoRecord.image);
  }

  return "";
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
      href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700&family=Nunito:wght@400;600;700;800&display=swap",
    },
  ],
}));
</script>

<template>
  <main
    class="relative isolate min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fffaf1_0%,#f7fbff_48%,#ffffff_100%)] font-['Nunito']"
  >
    <section
      class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12"
    >
      <Card
        v-if="catPending"
        class="border-slate-900/10 bg-white/80 backdrop-blur-md"
      >
        <CardContent class="p-5 text-sm text-muted-foreground">
          Un coussin est en train d'etre installe...
        </CardContent>
      </Card>

      <Card
        v-else-if="catError"
        class="border-slate-900/10 bg-white/80 backdrop-blur-md"
      >
        <CardContent class="p-5 text-sm text-destructive">
          Erreur : {{ catError.message }}
        </CardContent>
      </Card>

      <Card
        v-else-if="!cat"
        class="border-slate-900/10 bg-white/80 backdrop-blur-md"
      >
        <CardHeader>
          <CardTitle class="text-2xl">Chat introuvable</CardTitle>
          <CardDescription>
            Aucun chat publie ne correspond a ce sous-domaine.
          </CardDescription>
        </CardHeader>
      </Card>

      <template v-else>
        <section
          class="grid gap-8 rounded-[1.75rem] border border-slate-900/10 bg-gradient-to-br from-white/95 to-amber-50/60 p-6 shadow-[0_24px_50px_rgba(14,31,53,0.14)] md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-center md:p-9 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4"
          @pointermove="onHeroPointerMove"
          @pointerleave="onHeroPointerLeave"
        >
          <div class="flex flex-col gap-4">
            <p
              class="m-0 text-xs font-bold uppercase tracking-[0.18em] text-slate-900/65"
            >
              Bienvenue dans la taniere de
            </p>
            <h1
              class="m-0 font-['Baloo_2'] text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] text-slate-900"
            >
              {{ cat.name }}
            </h1>
            <p
              class="m-0 max-w-[48ch] text-[1.05rem] font-semibold text-slate-900/80"
            >
              {{
                cat.description ||
                "Un chat extraordinaire avec beaucoup de style."
              }}
            </p>

            <div class="flex flex-wrap gap-2">
              <span
                class="rounded-full border border-slate-900/15 bg-white/90 px-3 py-1 text-sm font-bold text-slate-900/75"
                >{{ totalPhotos }} souvenirs</span
              >
              <span
                class="rounded-full border border-slate-900/15 bg-white/90 px-3 py-1 text-sm font-bold text-slate-900/75"
                >{{ totalSections }} moments racontes</span
              >
              <span
                v-if="catYear"
                class="rounded-full border border-slate-900/15 bg-white/90 px-3 py-1 text-sm font-bold text-slate-900/75"
                >Star depuis {{ catYear }}</span
              >
            </div>

            <div class="mt-1 flex flex-wrap gap-3">
              <a
                class="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-extrabold tracking-[0.01em] text-white transition duration-200 hover:-translate-y-0.5 hover:bg-sky-900 hover:shadow-[0_10px_20px_rgba(16,42,67,0.25)]"
                href="#story"
                >Explorer son histoire</a
              >
              <a
                v-if="previewPhotos.length"
                class="inline-flex items-center justify-center rounded-full border border-slate-900/20 bg-white/90 px-5 py-3 text-sm font-extrabold tracking-[0.01em] text-slate-900 transition duration-200 hover:-translate-y-0.5 hover:bg-white"
                href="#gallery"
              >
                Voir les photos
              </a>
            </div>
          </div>

          <div class="flex items-center justify-center">
            <figure
              v-if="coverUrl"
              class="w-full max-w-[26rem] overflow-hidden rounded-3xl border-4 border-white/85 shadow-[0_20px_34px_rgba(15,23,42,0.2)] transition-transform duration-200 ease-out"
              :style="heroImageStyle"
            >
              <img
                :src="coverUrl"
                :alt="cat.name"
                class="h-[clamp(16rem,45vw,23rem)] w-full object-cover"
              />
            </figure>
            <div
              v-else
              class="w-full max-w-[22rem] rounded-2xl border-2 border-dashed border-slate-900/20 bg-white/80 px-5 py-10 text-center font-bold text-slate-900/70"
            >
              Pas encore de photo de couverture
            </div>
          </div>
        </section>

        <section
          v-if="previewPhotos.length"
          id="gallery"
          class="grid grid-cols-2 gap-4 md:grid-cols-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:delay-100"
        >
          <article
            v-for="photo in previewPhotos"
            :key="photo.id"
            class="overflow-hidden rounded-2xl border border-slate-900/10 bg-white/90 shadow-[0_14px_28px_rgba(15,23,42,0.12)] transition duration-200 hover:-translate-y-1 hover:rotate-[-0.3deg] hover:shadow-[0_20px_34px_rgba(15,23,42,0.18)]"
          >
            <img
              :src="photo.imageUrl"
              :alt="photo.caption || `Photo de ${cat.name}`"
              class="h-48 w-full object-cover md:h-56"
            />
            <p
              class="m-0 px-3.5 pb-3.5 pt-2.5 text-sm font-bold text-slate-900/75"
            >
              {{ photo.caption || "Instant mignon" }}
            </p>
          </article>
        </section>

        <section
          id="story"
          class="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:delay-150"
        >
          <Card
            v-if="storyPending || photosPending"
            class="border-slate-900/10 bg-white/80 backdrop-blur-md"
          >
            <CardContent class="p-5 text-sm text-muted-foreground">
              Chargement du storytelling...
            </CardContent>
          </Card>

          <Card
            v-else-if="storyError || photosError"
            class="border-slate-900/10 bg-white/80 backdrop-blur-md"
          >
            <CardContent class="p-5 text-sm text-destructive">
              Erreur : {{ storyError?.message || photosError?.message }}
            </CardContent>
          </Card>

          <StorySectionRenderer
            v-else-if="hasStorySections"
            :sections="storySections || []"
            :photos="photos || []"
          />

          <PhotoGallery v-else :photos="photos || []" />
        </section>
      </template>
    </section>
  </main>
</template>
