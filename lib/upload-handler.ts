import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public/uploads");

export type UploadFolder = "logos" | "covers" | "gallery" | "blog" | "general";

export async function processAndSaveImage(
  buffer: Buffer,
  folder: UploadFolder,
  opts: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<{ url: string; width: number; height: number; size: number }> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 85 } = opts;

  const destDir = path.join(UPLOAD_DIR, folder);
  await fs.mkdir(destDir, { recursive: true });

  const filename = `${randomUUID()}.webp`;
  const filepath = path.join(destDir, filename);

  const image = sharp(buffer).rotate(); // auto-rotate from EXIF
  const metadata = await image.metadata();

  const resized = image.resize({
    width: maxWidth,
    height: maxHeight,
    fit: "inside",
    withoutEnlargement: true,
  });

  const outputBuffer = await resized.webp({ quality }).toBuffer({ resolveWithObject: true });
  await fs.writeFile(filepath, outputBuffer.data);

  return {
    url: `/uploads/${folder}/${filename}`,
    width: outputBuffer.info.width,
    height: outputBuffer.info.height,
    size: outputBuffer.info.size,
  };
}

export async function deleteUploadedFile(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  const filepath = path.join(process.cwd(), "public", url);
  await fs.unlink(filepath).catch(() => {});
}

export const UPLOAD_LIMITS = {
  logos: { maxWidth: 400, maxHeight: 400, quality: 90, maxFileSizeBytes: 2 * 1024 * 1024 },
  covers: { maxWidth: 1200, maxHeight: 400, quality: 85, maxFileSizeBytes: 5 * 1024 * 1024 },
  gallery: { maxWidth: 1200, maxHeight: 900, quality: 85, maxFileSizeBytes: 5 * 1024 * 1024 },
  blog: { maxWidth: 1200, maxHeight: 630, quality: 85, maxFileSizeBytes: 5 * 1024 * 1024 },
  general: { maxWidth: 1920, maxHeight: 1080, quality: 85, maxFileSizeBytes: 10 * 1024 * 1024 },
};

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
