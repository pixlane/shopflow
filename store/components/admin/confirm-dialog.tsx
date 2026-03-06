"use client";

import { Modal } from "./modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  variant?: "destructive" | "default";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  loading = false,
  variant = "destructive",
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="p-5 flex flex-col items-center text-center gap-4">
        <div
          className={`h-11 w-11 rounded-full flex items-center justify-center ${
            variant === "destructive" ? "bg-red-50" : "bg-secondary"
          }`}
        >
          <AlertTriangle
            size={20}
            className={
              variant === "destructive" ? "text-red-500" : "text-muted-foreground"
            }
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex gap-2 w-full">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-md border border-border text-sm hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors disabled:opacity-60 ${
              variant === "destructive"
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-foreground text-background hover:bg-foreground/90"
            }`}
          >
            {loading ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
