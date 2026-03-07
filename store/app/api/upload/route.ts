import { NextRequest, NextResponse } from "next/server";
import { addMedia } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, GIF are allowed" },
        { status: 415 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)" },
        { status: 413 }
      );
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const media = addMedia({
      url: dataUrl,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      alt: file.name.replace(/\.[^.]+$/, ""),
    });

    return NextResponse.json(
      {
        data: {
          url: media.url,
          filename: media.filename,
          size: media.size,
          mimeType: media.mimeType,
          id: media.id,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
