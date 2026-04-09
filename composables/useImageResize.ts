type ResizeImageOptions = {
  maxWidth?: number;
  quality?: number;
};

const DEFAULT_MAX_WIDTH = 1600;
const DEFAULT_IMAGE_QUALITY = 0.82;

function buildResizedFileName(fileName: string): string {
  const extensionIndex = fileName.lastIndexOf(".");
  const baseName =
    extensionIndex > 0 ? fileName.slice(0, extensionIndex) : fileName;

  return `${baseName}.jpg`;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Impossible de lire l'image ${file.name}`));
    };

    image.src = objectUrl;
  });
}

function canvasToJpegFile(
  canvas: HTMLCanvasElement,
  originalFile: File,
  quality: number,
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(`Impossible de compresser l'image ${originalFile.name}`),
          );
          return;
        }

        resolve(
          new File([blob], buildResizedFileName(originalFile.name), {
            type: "image/jpeg",
            lastModified: originalFile.lastModified,
          }),
        );
      },
      "image/jpeg",
      quality,
    );
  });
}

export function useImageResize() {
  async function resizeImageForUpload(
    file: File,
    options: ResizeImageOptions = {},
  ): Promise<File> {
    if (!file.type.startsWith("image/")) {
      return file;
    }

    const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;
    const quality = options.quality ?? DEFAULT_IMAGE_QUALITY;
    const image = await loadImageFromFile(file);

    if (image.naturalWidth <= maxWidth) {
      return file;
    }

    const scale = maxWidth / image.naturalWidth;
    const canvas = document.createElement("canvas");
    canvas.width = maxWidth;
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Impossible de préparer l'image pour le téléversement");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvasToJpegFile(canvas, file, quality);
  }

  return {
    resizeImageForUpload,
  };
}
