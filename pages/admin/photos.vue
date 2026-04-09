<script setup lang="ts">
import { Button } from "~/components/ui/button";
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";
import { Input } from "~/components/ui/input";
import Label from "~/components/ui/Label.vue";
import type { CatRecord, PhotoRecord } from "~/types/models";

definePageMeta({
  middleware: ["auth"],
  layout: "admin",
});

const pb = usePocketbase();
const { resizeImageForUpload } = useImageResize();
const selectedCatId = useState<string | null>("admin-selected-cat", () => null);
const selectedFiles = ref<File[]>([]);
const fileInputKey = ref(0);
const isUploading = ref(false);
const uploadStage = ref<"idle" | "preparing" | "uploading">("idle");
const uploadError = ref("");
const uploadSuccess = ref("");
const captionDrafts = ref<Record<string, string>>({});
const captionSaving = ref<Record<string, boolean>>({});
const captionError = ref<Record<string, string>>({});
const captionSuccess = ref<Record<string, string>>({});
const coverSavingId = ref<string | null>(null);
const coverError = ref("");
const coverSuccess = ref("");

const { data: currentCat, refresh: refreshCurrentCat } = await useAsyncData(
  () => `admin-photos-cat-${selectedCatId.value || "none"}`,
  async () => {
    if (!selectedCatId.value) {
      return null;
    }

    return pb.collection("cats").getOne<CatRecord>(selectedCatId.value);
  },
  { watch: [selectedCatId] },
);

const {
  data: photos,
  pending,
  error,
  refresh,
} = await useAsyncData(
  () => `admin-photos-${selectedCatId.value || "none"}`,
  async () => {
    if (!selectedCatId.value) {
      return [] as PhotoRecord[];
    }

    return pb.collection("photos").getFullList<PhotoRecord>({
      sort: "-created",
      filter: `cat = "${selectedCatId.value}"`,
    });
  },
  { watch: [selectedCatId] },
);

function onFilesChange(event: Event) {
  const target = event.target as HTMLInputElement;
  selectedFiles.value = Array.from(target.files || []);
}

watch(
  () => photos.value,
  (value) => {
    const nextDrafts: Record<string, string> = {};

    for (const photo of value || []) {
      nextDrafts[photo.id] = photo.caption || "";
    }

    captionDrafts.value = nextDrafts;
    captionSaving.value = {};
    captionError.value = {};
    captionSuccess.value = {};
  },
  { immediate: true },
);

function isCaptionDirty(photo: PhotoRecord) {
  return (captionDrafts.value[photo.id] || "") !== (photo.caption || "");
}

function photoUrl(photo: PhotoRecord) {
  if (!photo.image) {
    return "";
  }

  return pb.files.getURL(photo, photo.image);
}

function isCurrentCover(photo: PhotoRecord) {
  return currentCat.value?.coverPhoto === photo.id;
}

async function onSetCoverPhoto(photoId: string) {
  if (!selectedCatId.value || currentCat.value?.coverPhoto === photoId) {
    return;
  }

  coverSavingId.value = photoId;
  coverError.value = "";
  coverSuccess.value = "";

  try {
    await pb.collection("cats").update(selectedCatId.value, {
      coverPhoto: photoId,
    });
    coverSuccess.value = "Image de couverture mise à jour.";
    await Promise.all([
      refreshCurrentCat(),
      refreshNuxtData("admin-sidebar-cats"),
    ]);
  } catch (err) {
    coverError.value =
      err instanceof Error
        ? err.message
        : "Impossible de définir l'image de couverture";
  } finally {
    coverSavingId.value = null;
  }
}

async function onSaveCaption(photoId: string) {
  const nextCaption = (captionDrafts.value[photoId] || "").trim();

  captionSaving.value[photoId] = true;
  captionError.value[photoId] = "";
  captionSuccess.value[photoId] = "";

  try {
    await pb.collection("photos").update(photoId, {
      caption: nextCaption,
    });

    captionSuccess.value[photoId] = "Légende enregistrée.";
    await refresh();
  } catch (err) {
    captionError.value[photoId] =
      err instanceof Error
        ? err.message
        : "Impossible de mettre à jour la légende";
  } finally {
    captionSaving.value[photoId] = false;
  }
}

async function onUploadPhotos() {
  if (!selectedCatId.value) {
    return;
  }

  if (!selectedFiles.value.length) {
    uploadError.value = "Ajoutez au moins une image.";
    uploadSuccess.value = "";
    return;
  }

  isUploading.value = true;
  uploadStage.value = "preparing";
  uploadError.value = "";
  uploadSuccess.value = "";

  try {
    const filesToUpload = await Promise.all(
      selectedFiles.value.map((file) =>
        resizeImageForUpload(file, {
          maxWidth: 1600,
          quality: 0.82,
        }),
      ),
    );

    uploadStage.value = "uploading";

    await Promise.all(
      filesToUpload.map((file) =>
        pb.collection("photos").create<PhotoRecord>({
          cat: selectedCatId.value as string,
          image: file,
        }),
      ),
    );

    const uploadedCount = selectedFiles.value.length;
    selectedFiles.value = [];
    fileInputKey.value += 1;
    uploadSuccess.value =
      uploadedCount > 1
        ? `${uploadedCount} photos ont été ajoutées. Ajoutez les légendes ci-dessous.`
        : "1 photo a été ajoutée. Ajoutez la légende ci-dessous.";

    await refresh();
  } catch (err) {
    uploadError.value =
      err instanceof Error
        ? err.message
        : "Impossible de téléverser les photos";
  } finally {
    isUploading.value = false;
    uploadStage.value = "idle";
  }
}
</script>

<template>
  <section class="grid gap-4">
    <Card>
      <CardHeader>
        <CardTitle class="text-xl">Ajouter des photos</CardTitle>
        <CardDescription>
          Sélectionnez plusieurs images pour le chat actuellement sélectionné.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="grid gap-4" @submit.prevent="onUploadPhotos">
          <div class="grid gap-2">
            <Label for="photo-files">Images</Label>
            <input
              :key="fileInputKey"
              id="photo-files"
              type="file"
              accept="image/*"
              multiple
              :disabled="!selectedCatId || isUploading"
              class="flex w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50"
              @change="onFilesChange"
            />
            <p class="text-xs text-muted-foreground">
              {{
                selectedFiles.length
                  ? `${selectedFiles.length} fichier(s) sélectionné(s)`
                  : "Aucun fichier sélectionné"
              }}
            </p>
          </div>

          <div class="grid gap-2">
            <p class="text-sm text-muted-foreground">
              Les images trop grandes sont réduites à 1600 px de large avant
              téléversement, puis les légendes sont ajoutées individuellement.
            </p>
          </div>

          <Button type="submit" :disabled="!selectedCatId || isUploading">
            {{
              uploadStage === "preparing"
                ? "Préparation des images..."
                : uploadStage === "uploading"
                  ? "Téléversement..."
                  : "Ajouter les photos"
            }}
          </Button>

          <p v-if="uploadSuccess" class="text-sm text-green-600">
            {{ uploadSuccess }}
          </p>
          <p v-if="uploadError" class="text-sm text-destructive">
            {{ uploadError }}
          </p>
        </form>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <p v-if="pending" class="text-sm text-muted-foreground">
          Chargement des photos...
        </p>
        <p v-else-if="error" class="text-sm text-destructive">
          Erreur : {{ error.message }}
        </p>
        <p v-else-if="!selectedCatId" class="text-sm text-muted-foreground">
          Aucun chat sélectionné.
        </p>
        <p v-else-if="!photos?.length" class="text-sm text-muted-foreground">
          Aucune photo pour le moment.
        </p>
        <ul v-else class="grid gap-2">
          <li
            v-for="photo in photos"
            :key="photo.id"
            class="flex flex-wrap items-start gap-3 rounded-md border border-border bg-card p-3"
          >
            <img
              v-if="photo.image"
              :src="photoUrl(photo)"
              :alt="captionDrafts[photo.id] || 'Photo de chat'"
              class="h-24 w-24 shrink-0 rounded-md border border-border object-cover"
            />

            <div class="grid min-w-[240px] flex-1 gap-2">
              <div class="flex flex-wrap items-center gap-2">
                <Input
                  :model-value="captionDrafts[photo.id] || ''"
                  placeholder="Ajouter une légende"
                  class="w-full max-w-md"
                  :disabled="captionSaving[photo.id]"
                  @update:model-value="captionDrafts[photo.id] = String($event)"
                />
                <Button
                  type="button"
                  :disabled="captionSaving[photo.id] || !isCaptionDirty(photo)"
                  @click="onSaveCaption(photo.id)"
                >
                  {{
                    captionSaving[photo.id]
                      ? "Enregistrement..."
                      : "Enregistrer"
                  }}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  :disabled="
                    coverSavingId === photo.id || isCurrentCover(photo)
                  "
                  @click="onSetCoverPhoto(photo.id)"
                >
                  {{
                    coverSavingId === photo.id
                      ? "Mise à jour..."
                      : isCurrentCover(photo)
                        ? "Couverture actuelle"
                        : "Définir comme couverture"
                  }}
                </Button>
              </div>

              <p v-if="captionSuccess[photo.id]" class="text-xs text-green-600">
                {{ captionSuccess[photo.id] }}
              </p>
              <p v-if="captionError[photo.id]" class="text-xs text-destructive">
                {{ captionError[photo.id] }}
              </p>
              <p
                v-if="isCurrentCover(photo)"
                class="text-xs font-medium text-green-600"
              >
                Cette photo est utilisée comme couverture.
              </p>
            </div>
          </li>
        </ul>
        <p v-if="coverSuccess" class="mt-3 text-sm text-green-600">
          {{ coverSuccess }}
        </p>
        <p v-if="coverError" class="mt-3 text-sm text-destructive">
          {{ coverError }}
        </p>
      </CardContent>
    </Card>
  </section>
</template>
