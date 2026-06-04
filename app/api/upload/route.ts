import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_FOLDERS = ["logos", "covers", "blog", "pages", "gallery"] as const;
type AllowedFolder = typeof ALLOWED_FOLDERS[number] | "uploads";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const folderParam = searchParams.get("folder") ?? "";
    const folder: AllowedFolder = (ALLOWED_FOLDERS as readonly string[]).includes(folderParam)
      ? (folderParam as AllowedFolder)
      : "uploads";

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}` },
        { status: 415 }
      );
    }

    // Read file as Buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Validate size
    if (inputBuffer.byteLength > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 413 });
    }

    // Process with Sharp
    const transformer = sharp(inputBuffer).resize(1200, 1200, { fit: "inside" }).webp({ quality: 85 });
    const { width, height } = await transformer.metadata().then(() =>
      sharp(inputBuffer).resize(1200, 1200, { fit: "inside" }).metadata()
    );

    const outputBuffer = await transformer.toBuffer();

    // Resolve output dimensions after processing
    const outputMeta = await sharp(outputBuffer).metadata();
    const outWidth = outputMeta.width ?? 0;
    const outHeight = outputMeta.height ?? 0;

    // Generate unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const relativePath = `/uploads/${folder}/${filename}`;
    const absoluteDir = path.join(process.cwd(), "public", "uploads", folder);
    const absolutePath = path.join(absoluteDir, filename);

    // Ensure directory exists
    await fs.promises.mkdir(absoluteDir, { recursive: true });

    // Write file
    await fs.promises.writeFile(absolutePath, outputBuffer);

    // Save Media record
    const media = await prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: "image/webp",
        size: outputBuffer.length,
        url: relativePath,
        width: outWidth,
        height: outHeight,
        folder,
      },
    });

    return NextResponse.json(
      { url: relativePath, width: outWidth, height: outHeight, mediaId: media.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("[upload] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
