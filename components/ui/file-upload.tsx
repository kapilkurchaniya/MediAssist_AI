"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUpload: (file: File) => void;
  isLoading?: boolean;
  maxSizeMB?: number;
  accept?: Record<string, string[]>;
  className?: string;
}

export function FileUpload({
  onUpload,
  isLoading = false,
  maxSizeMB = 5,
  accept = { "image/*": [".jpeg", ".png", ".jpg", ".webp"] },
  className,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        onUpload(file);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
    disabled: isLoading,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-12 text-center transition-all hover:bg-muted/50",
        isDragActive && "border-primary bg-primary/5",
        isDragReject && "border-danger bg-danger/5",
        isLoading && "pointer-events-none opacity-60",
        className
      )}
    >
      <input {...getInputProps()} />

      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">Analyzing Prescription...</p>
            <p className="text-sm text-muted-foreground">
              Our AI is currently reading the handwriting and extracting medicines. This may take a few seconds.
            </p>
          </div>
        </div>
      ) : selectedFile ? (
        <div className="flex w-full flex-col items-center gap-4">
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-64 w-auto rounded-md object-contain shadow-sm"
            />
          )}
          <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 shadow-sm">
            <File className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{selectedFile.name}</span>
            <button
              type="button"
              onClick={removeFile}
              className="ml-2 rounded-full p-1 hover:bg-muted"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-primary/10 p-4">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-muted-foreground">
              SVG, PNG, JPG or WEBP (max. {maxSizeMB}MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
