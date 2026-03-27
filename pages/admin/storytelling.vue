<script setup lang="ts">
import { GripVertical, Pencil, Plus, Save, Trash2, X } from "lucide-vue-next";
import { Button } from "~/components/ui/button";
import Card from "~/components/ui/Card.vue";
import CardContent from "~/components/ui/CardContent.vue";
import CardDescription from "~/components/ui/CardDescription.vue";
import CardHeader from "~/components/ui/CardHeader.vue";
import CardTitle from "~/components/ui/CardTitle.vue";
import { Input } from "~/components/ui/input";
import Label from "~/components/ui/Label.vue";
import type {
  PhotoRecord,
  StorySectionRecord,
  StorySectionType,
} from "~/types/models";

definePageMeta({
  middleware: ["auth"],
  layout: "admin",
});

type StorySectionDraft = {
  id: string;
  type: StorySectionType;
  title: string;
  text: string;
  photos: string[];
  order: number;
  isVisible: boolean;
  isDeleting: boolean;
};

const sectionTypeOptions: Array<{
  value: StorySectionType;
  label: string;
  description: string;
}> = [
  {
    value: "hero",
    label: "Hero",
    description: "Mise en avant visuelle avec titre/texte.",
  },
  {
    value: "content",
    label: "Contenu",
    description: "Bloc éditorial classique avec texte et images.",
  },
  {
    value: "gallery",
    label: "Galerie",
    description: "Grille d'images avec titre/description optionnels.",
  },
];

const pb = usePocketbase();
const selectedCatId = useState<string | null>("admin-selected-cat", () => null);

const isCreatingSection = ref(false);
const createSectionError = ref("");
const reorderError = ref("");
const isReordering = ref(false);
const deleteError = ref("");

const editingSectionId = ref<string | null>(null);
const editSaving = ref(false);
const editError = ref("");
const editSuccess = ref("");

const editType = ref<StorySectionType>("content");
const editTitle = ref("");
const editText = ref("");
const editPhotos = ref<string[]>([]);
const editIsVisible = ref(true);

const draggedSectionId = ref<string | null>(null);
const dragOverSectionId = ref<string | null>(null);

const {
  data: photos,
  pending: photosPending,
  error: photosError,
} = await useAsyncData(
  () => `admin-storytelling-photos-${selectedCatId.value || "none"}`,
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

const {
  data: sections,
  pending: sectionsPending,
  error: sectionsError,
  refresh: refreshSections,
} = await useAsyncData(
  () => `admin-storytelling-sections-${selectedCatId.value || "none"}`,
  async () => {
    if (!selectedCatId.value) {
      return [] as StorySectionRecord[];
    }

    return pb.collection("story_sections").getFullList<StorySectionRecord>({
      sort: "+order,+created",
      filter: `cat = "${selectedCatId.value}"`,
    });
  },
  { watch: [selectedCatId] },
);

const drafts = ref<StorySectionDraft[]>([]);

function toPhotoIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string" && value) {
    return [value];
  }

  return [];
}

function photoUrl(photo: PhotoRecord): string {
  if (!photo.image) {
    return "";
  }

  return pb.files.getURL(photo, photo.image);
}

watch(
  () => sections.value,
  (nextSections) => {
    drafts.value = (nextSections || []).map((section, index) => ({
      id: section.id,
      type: section.type || "content",
      title: section.title || "",
      text: section.text || "",
      photos: toPhotoIds(section.photos),
      order: Number(section.order ?? index),
      isVisible: section.isVisible !== false,
      isDeleting: false,
    }));
    reorderError.value = "";
    deleteError.value = "";
  },
  { immediate: true },
);

function sectionTypeLabel(value: StorySectionType): string {
  return (
    sectionTypeOptions.find((option) => option.value === value)?.label || value
  );
}

function toggleEditPhoto(photoId: string): void {
  if (editPhotos.value.includes(photoId)) {
    editPhotos.value = editPhotos.value.filter((id) => id !== photoId);
    return;
  }

  editPhotos.value = [...editPhotos.value, photoId];
}

function resetEditState(): void {
  editingSectionId.value = null;
  editType.value = "content";
  editTitle.value = "";
  editText.value = "";
  editPhotos.value = [];
  editIsVisible.value = true;
  editSaving.value = false;
  editError.value = "";
  editSuccess.value = "";
}

function openEditDialog(draft: StorySectionDraft): void {
  editingSectionId.value = draft.id;
  editType.value = draft.type;
  editTitle.value = draft.title;
  editText.value = draft.text;
  editPhotos.value = [...draft.photos];
  editIsVisible.value = draft.isVisible;
  editError.value = "";
  editSuccess.value = "";
}

function closeEditDialog(): void {
  resetEditState();
}

const editingSection = computed(() => {
  if (!editingSectionId.value) {
    return null;
  }

  return (
    drafts.value.find((draft) => draft.id === editingSectionId.value) || null
  );
});

function applyDraftOrder(nextDrafts: StorySectionDraft[]): StorySectionDraft[] {
  return nextDrafts.map((draft, index) => ({
    ...draft,
    order: index,
  }));
}

async function persistOrder(
  previousDrafts: StorySectionDraft[],
): Promise<void> {
  reorderError.value = "";
  isReordering.value = true;

  try {
    await Promise.all(
      drafts.value.map((draft, index) =>
        pb.collection("story_sections").update(draft.id, {
          order: index,
        }),
      ),
    );
    await refreshSections();
  } catch (error) {
    drafts.value = previousDrafts;
    reorderError.value =
      error instanceof Error
        ? error.message
        : "Impossible de sauvegarder l'ordre";
  } finally {
    isReordering.value = false;
  }
}

function onDragStart(sectionId: string, event: DragEvent): void {
  draggedSectionId.value = sectionId;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", sectionId);
  }
}

function onDragEnd(): void {
  draggedSectionId.value = null;
  dragOverSectionId.value = null;
}

function onDragOver(sectionId: string, event: DragEvent): void {
  event.preventDefault();
  dragOverSectionId.value = sectionId;
}

async function onDrop(sectionId: string, event: DragEvent): Promise<void> {
  event.preventDefault();

  const sourceId = draggedSectionId.value;
  draggedSectionId.value = null;
  dragOverSectionId.value = null;

  if (!sourceId || sourceId === sectionId || isReordering.value) {
    return;
  }

  const fromIndex = drafts.value.findIndex((draft) => draft.id === sourceId);
  const toIndex = drafts.value.findIndex((draft) => draft.id === sectionId);

  if (fromIndex === -1 || toIndex === -1) {
    return;
  }

  const previousDrafts = drafts.value.map((draft) => ({
    ...draft,
    photos: [...draft.photos],
  }));

  const nextDrafts = [...drafts.value];
  const [moved] = nextDrafts.splice(fromIndex, 1);
  nextDrafts.splice(toIndex, 0, moved);
  drafts.value = applyDraftOrder(nextDrafts);

  await persistOrder(previousDrafts);
}

async function onAddSection(): Promise<void> {
  if (!selectedCatId.value) {
    return;
  }

  isCreatingSection.value = true;
  createSectionError.value = "";

  try {
    const nextOrder = drafts.value.length
      ? Math.max(...drafts.value.map((draft) => draft.order)) + 1
      : 0;

    const created = await pb
      .collection("story_sections")
      .create<StorySectionRecord>({
        cat: selectedCatId.value,
        type: "content",
        title: "",
        text: "",
        photos: [],
        order: nextOrder,
        isVisible: true,
      });

    await refreshSections();
    const createdDraft = drafts.value.find((draft) => draft.id === created.id);
    if (createdDraft) {
      openEditDialog(createdDraft);
    }
  } catch (error) {
    createSectionError.value =
      error instanceof Error
        ? error.message
        : "Impossible d'ajouter la section";
  } finally {
    isCreatingSection.value = false;
  }
}

async function onSaveSection(): Promise<void> {
  if (!editingSection.value) {
    return;
  }

  editSaving.value = true;
  editError.value = "";
  editSuccess.value = "";

  try {
    await pb.collection("story_sections").update(editingSection.value.id, {
      type: editType.value,
      title: editTitle.value.trim(),
      text: editText.value.trim(),
      photos: editPhotos.value,
      order: editingSection.value.order,
      isVisible: editIsVisible.value,
    });

    editSuccess.value = "Section enregistrée.";
    await refreshSections();
  } catch (error) {
    editError.value =
      error instanceof Error
        ? error.message
        : "Impossible de sauvegarder la section";
  } finally {
    editSaving.value = false;
  }
}

async function onDeleteSection(draft: StorySectionDraft): Promise<void> {
  draft.isDeleting = true;
  deleteError.value = "";

  try {
    await pb.collection("story_sections").delete(draft.id);
    if (editingSectionId.value === draft.id) {
      closeEditDialog();
    }
    await refreshSections();
    const previousDrafts = drafts.value.map((item) => ({
      ...item,
      photos: [...item.photos],
    }));
    drafts.value = applyDraftOrder(drafts.value);
    await persistOrder(previousDrafts);
  } catch (error) {
    deleteError.value =
      error instanceof Error
        ? error.message
        : "Impossible de supprimer la section";
  } finally {
    draft.isDeleting = false;
  }
}

watch(
  () => selectedCatId.value,
  () => {
    closeEditDialog();
  },
);
</script>

<template>
  <section class="grid gap-4">
    <div
      class="grid gap-3 rounded-lg border border-border bg-background p-4 md:p-5"
    >
      <div class="grid gap-1">
        <h1 class="text-xl font-semibold">Storytelling</h1>
        <p class="text-sm text-muted-foreground">
          Créez des sections composées de titre, texte et 0 à N images. Les
          images sont sélectionnées depuis les photos du chat courant.
        </p>
      </div>
      <ul class="grid gap-2 text-sm text-muted-foreground">
        <li v-for="option in sectionTypeOptions" :key="option.value">
          <span class="font-medium text-foreground"> {{ option.label }}: </span>
          {{ option.description }}
        </li>
      </ul>

      <div class="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          :disabled="!selectedCatId || isCreatingSection"
          @click="onAddSection"
        >
          <Plus class="size-4" />
          {{ isCreatingSection ? "Ajout..." : "Ajouter une section" }}
        </Button>
      </div>

      <p v-if="createSectionError" class="text-sm text-destructive">
        {{ createSectionError }}
      </p>
      <p v-if="isReordering" class="text-sm text-muted-foreground">
        Enregistrement automatique de l'ordre...
      </p>
      <p v-if="reorderError" class="text-sm text-destructive">
        {{ reorderError }}
      </p>
      <p v-if="deleteError" class="text-sm text-destructive">
        {{ deleteError }}
      </p>
    </div>

    <p v-if="sectionsPending" class="text-sm text-muted-foreground">
      Chargement des sections...
    </p>
    <p v-else-if="sectionsError" class="text-sm text-destructive">
      Erreur : {{ sectionsError.message }}
    </p>
    <p v-else-if="!selectedCatId" class="text-sm text-muted-foreground">
      Aucun chat sélectionné.
    </p>
    <p v-else-if="!drafts.length" class="text-sm text-muted-foreground">
      Aucune section pour le moment. Ajoutez une première section.
    </p>

    <ul v-else class="grid gap-2">
      <li
        v-for="draft in drafts"
        :key="draft.id"
        draggable="true"
        class="flex items-center gap-2 rounded-md border border-border bg-background cursor-grab px-2 py-1.5 transition-colors"
        :class="{
          'border-primary/70 bg-primary/5': dragOverSectionId === draft.id,
          'opacity-60': draggedSectionId === draft.id,
        }"
        @dragstart="onDragStart(draft.id, $event)"
        @dragend="onDragEnd"
        @dragover="onDragOver(draft.id, $event)"
        @drop="onDrop(draft.id, $event)"
      >
        <GripVertical class="size-3.5" />
        <button
          type="button"
          class="flex min-w-0 flex-1 items-center gap-2 rounded-sm px-2 py-1 text-left hover:bg-muted/60"
          @click="openEditDialog(draft)"
        >
          <span
            class="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            {{ sectionTypeLabel(draft.type) }}
          </span>
          <span class="truncate text-sm font-medium text-foreground">
            {{ draft.title || "Sans titre" }}
          </span>
        </button>

        <div class="flex shrink-0 items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="text-muted-foreground hover:bg-muted hover:text-foreground"
            @click.stop="openEditDialog(draft)"
          >
            <Pencil class="size-4" />
            <span class="sr-only">Editer</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="text-destructive hover:bg-destructive/10 hover:text-destructive"
            :disabled="draft.isDeleting"
            @click.stop="onDeleteSection(draft)"
          >
            <Trash2 class="size-4" />
            <span class="sr-only">
              {{ draft.isDeleting ? "Suppression" : "Supprimer" }}
            </span>
          </Button>
        </div>
      </li>
    </ul>

    <div
      v-if="editingSection"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="closeEditDialog"
    >
      <Card class="max-h-[90vh] w-full max-w-3xl overflow-hidden">
        <CardHeader class="border-b border-border">
          <div class="flex items-start justify-between gap-3">
            <div class="grid gap-1">
              <CardTitle class="text-lg">Modifier la section</CardTitle>
              <CardDescription>
                Mettez a jour le contenu, les images et la visibilite de la
                section.
              </CardDescription>
            </div>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              @click="closeEditDialog"
            >
              <X class="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent class="max-h-[70vh] overflow-y-auto p-4 md:p-6">
          <form class="grid gap-4" @submit.prevent="onSaveSection">
            <div class="grid gap-2">
              <Label for="edit-section-type">Type de section</Label>
              <select
                id="edit-section-type"
                v-model="editType"
                class="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option
                  v-for="option in sectionTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="grid gap-2">
              <Label for="edit-section-title">Titre</Label>
              <Input
                id="edit-section-title"
                v-model="editTitle"
                placeholder="Titre de la section"
              />
            </div>

            <div class="grid gap-2">
              <Label for="edit-section-text">Texte</Label>
              <textarea
                id="edit-section-text"
                v-model="editText"
                rows="5"
                placeholder="Racontez l'histoire de votre chat"
                class="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div class="grid gap-2">
              <Label>Images de la section (0-N)</Label>
              <p v-if="photosPending" class="text-xs text-muted-foreground">
                Chargement des photos...
              </p>
              <p v-else-if="photosError" class="text-xs text-destructive">
                Erreur : {{ photosError.message }}
              </p>
              <p
                v-else-if="!photos?.length"
                class="text-xs text-muted-foreground"
              >
                Aucune photo disponible. Ajoutez d'abord des photos dans
                l'onglet Photos.
              </p>
              <ul v-else class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <li
                  v-for="photo in photos"
                  :key="`edit-${photo.id}`"
                  class="rounded-md border border-border bg-background p-2"
                >
                  <label class="grid cursor-pointer gap-2">
                    <img
                      v-if="photo.image"
                      :src="photoUrl(photo)"
                      :alt="photo.caption || 'Photo de chat'"
                      class="h-28 w-full rounded-md object-cover"
                    />
                    <span class="line-clamp-1 text-xs text-muted-foreground">
                      {{ photo.caption || "Sans légende" }}
                    </span>
                    <span class="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        :checked="editPhotos.includes(photo.id)"
                        @change="toggleEditPhoto(photo.id)"
                      />
                      Utiliser cette image
                    </span>
                  </label>
                </li>
              </ul>
            </div>

            <label
              class="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <input v-model="editIsVisible" type="checkbox" class="h-4 w-4" />
              Section visible sur la page publique
            </label>

            <div class="flex flex-wrap items-center gap-2">
              <Button type="submit" :disabled="editSaving">
                <Save class="size-4" />
                {{ editSaving ? "Enregistrement..." : "Enregistrer" }}
              </Button>
              <Button
                type="button"
                variant="secondary"
                :disabled="editSaving"
                @click="closeEditDialog"
              >
                Fermer
              </Button>
            </div>

            <p v-if="editSuccess" class="text-sm text-green-600">
              {{ editSuccess }}
            </p>
            <p v-if="editError" class="text-sm text-destructive">
              {{ editError }}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
