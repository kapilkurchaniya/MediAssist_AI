"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/ui/file-upload";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Zap, AlertCircle } from "lucide-react";

export default function UploadPrescriptionPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/prescriptions/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        // Successfully uploaded and extracted
        router.push("/patient/prescriptions"); // Redirect to list or detail view
      } else {
        const data = await res.json();
        setError(data.error || "Failed to upload prescription.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Upload Prescription</h1>
        <p className="text-muted-foreground">
          Take a clear photo of your handwritten or printed prescription. 
          Our AI will extract the medicines and check for safety risks.
        </p>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-8">
          <FileUpload onUpload={handleUpload} isLoading={loading} />
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex gap-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Instant Extraction</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Gemini AI instantly reads handwriting and converts it into your digital schedule.
            </p>
          </div>
        </div>

        <div className="flex gap-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
            <ShieldCheck className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Safety Checks</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Every medicine is automatically checked for interactions and duplicate therapies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
