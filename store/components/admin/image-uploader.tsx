"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  X,
  GripVertical,
  Link as LinkIcon,
  Plus,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function ImageUploader({ value, onChange, max = 8 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlMode, setUrlMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  async function uploadFiles(files: FileList | File[]) {
    if (value.length >= max) return;
    setError(null);
    setUploading(true);
    const arr = Array.from(files).slice(0, max - value.length);
    const results: string[] = [];

    for (const file of arr) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Upload failed");
        continue;
      }
      const j = await res.json();
      results.push(j.data.url);
    }

    onChange([...value, ...results]);
    setUploading(false);
  }

  function addUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) {
      setError("URL already added");
      return;
    }
    onChange([...value, trimmed]);
    setUrlInput("");
    setUrlMode(false);
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
    },
    [value]
  );

  // Reorder via drag
  function handleItemDragStart(i: number) {
    setDragIdx(i);
  }
  function handleItemDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    setOverIdx(i);
  }
  function handleItemDrop(e: React.DragEvent, i: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const next = [...value];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    onChange(next);
    setDragIdx(null);
    setOverIdx(null);
  }

  return (
    <div className="space-y-3">
      {/* Existing images */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {value.map((url, i) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleItemDragStart(i)}
              onDragOver={(e) => handleItemDragOver(e, i)}
              onDrop={(e) => handleItemDrop(e, i)}
              onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
              className={cn(
                "group relative aspect-square rounded-lg overflow-hidden bg-secondary border-2 transition-all cursor-grab",
                i === 0 ? "border-foreground/40" : "border-transparent",
                overIdx === i && dragIdx !== i ? "border-dashed border-foreground/60 scale-105" : ""
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <GripVertical size={14} className="text-background" />
              </div>
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-foreground/80 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
              >
                <X size={10} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center bg-foreground/60 text-background text-[9px] py-0.5">
                  Cover
                </span>
              )}
            </div>
          ))}

          {/* Add more slot */}
          {value.length < max && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-foreground/40 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <Plus size={16} />
              <span className="text-[10px]">Add</span>
            </button>
          )}
        </div>
      )}

      {/* Drop zone — only shown when no images yet */}
      {value.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors py-10 gap-3 cursor-pointer",
            dragging
              ? "border-foreground bg-secondary"
              : "border-border hover:border-foreground/40"
          )}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <ImageIcon size={18} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Drop images here</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  or click to browse · PNG, JPG, WebP · max 10 MB each
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* File input (hidden) */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />

      {/* URL input mode */}
      <div className="flex items-center gap-2">
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={value.length >= max || uploading}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors disabled:opacity-40"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            Upload
          </button>
        )}
        <button
          type="button"
          onClick={() => setUrlMode(!urlMode)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
        >
          <LinkIcon size={12} />
          Paste URL
        </button>
      </div>

      {urlMode && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
            placeholder="https://example.com/image.jpg"
            className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={addUrl}
            className="h-9 px-3 rounded-md bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors"
          >
            Add
          </button>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-[11px] text-muted-foreground">
        {value.length}/{max} images · drag to reorder · first image is the cover
      </p>
    </div>
  );
}
