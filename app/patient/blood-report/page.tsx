"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Activity,
  Upload,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Heart,
  Stethoscope,
  X,
} from "lucide-react";

interface Biomarker {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low" | "unknown";
  recommendation?: string;
}

interface BloodReport {
  _id: string;
  fileName: string;
  biomarkers: Biomarker[];
  summary: {
    possibleMeanings: string;
    recommendations: string;
    whenToConsult: string;
  };
  createdAt: string;
}

export default function BloodReportPage() {
  const [reports, setReports] = useState<BloodReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/blood-report");
      if (res.ok) {
        const json = await res.json();
        setReports(json.reports || []);
      }
    } catch (err) {
      console.error("Failed to fetch blood reports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/blood-report/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        setReports((prev) => [json.report, ...prev]);
        setExpandedReport(json.report._id);
      } else {
        const errJson = await res.json();
        setError(errJson.error || "Failed to analyze blood report.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blood report?")) return;

    try {
      const res = await fetch(`/api/blood-report/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r._id !== id));
        if (expandedReport === id) setExpandedReport(null);
      } else {
        alert("Failed to delete the report.");
      }
    } catch {
      alert("An error occurred while deleting.");
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const getStatusIcon = (status: string) => {
    if (status === "high") return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
    if (status === "low") return <ArrowDownCircle className="h-4 w-4 text-amber-500" />;
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === "high") return <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-xs font-semibold">High</Badge>;
    if (status === "low") return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs font-semibold">Low</Badge>;
    return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs font-semibold">Normal</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 rounded-md bg-muted shimmer"></div>
        <div className="h-48 rounded-xl bg-card shimmer"></div>
        <div className="h-64 rounded-xl bg-card shimmer"></div>
      </div>
    );
  }

  const normalCount = (r: BloodReport) => r.biomarkers.filter((b) => b.status === "normal").length;
  const abnormalCount = (r: BloodReport) => r.biomarkers.filter((b) => b.status !== "normal" && b.status !== "unknown").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Blood Report Analyzer
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload your blood test report and get an AI-powered analysis of your results.
          </p>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3 items-start">
        <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            AI-Based Analysis Disclaimer
          </p>
          <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1">
            This tool provides AI-generated insights for educational purposes only. It is <strong>not a replacement for professional medical advice</strong>. Always consult your doctor for diagnosis and treatment decisions.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
        } ${uploading ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
        onClick={() => !uploading && document.getElementById("blood-file-input")?.click()}
      >
        <input
          id="blood-file-input"
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-lg font-semibold text-foreground">Analyzing your blood report...</p>
            <p className="text-sm text-muted-foreground">This may take 10–20 seconds depending on the report.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <p className="text-lg font-semibold text-foreground">Upload Blood Report</p>
            <p className="text-sm text-muted-foreground">
              Drag & drop your blood test report here, or click to browse.
            </p>
            <p className="text-xs text-muted-foreground">Supports PDF, JPG, PNG — max 10MB</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Report History */}
      {reports.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-semibold text-muted-foreground">No blood reports yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload your first blood report to get an AI-powered analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Your Reports</h2>
          {reports.map((report) => {
            const isExpanded = expandedReport === report._id;
            const abnormals = report.biomarkers.filter((b) => b.status === "high" || b.status === "low");
            const normals = report.biomarkers.filter((b) => b.status === "normal");

            return (
              <div key={report._id} className="rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md">
                {/* Report Header Row */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedReport(isExpanded ? null : report._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{report.fileName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(report.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                      {normalCount(report) > 0 && (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs">
                          {normalCount(report)} Normal
                        </Badge>
                      )}
                      {abnormalCount(report) > 0 && (
                        <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-xs">
                          {abnormalCount(report)} Abnormal
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); handleDelete(report._id); }}
                      className="text-danger hover:text-danger hover:bg-danger/10"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t p-4 space-y-6">
                    {/* Biomarker Table */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" /> All Biomarkers
                      </h3>
                      <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left p-3 font-semibold text-muted-foreground">Biomarker</th>
                              <th className="text-left p-3 font-semibold text-muted-foreground">Your Value</th>
                              <th className="text-left p-3 font-semibold text-muted-foreground">Reference Range</th>
                              <th className="text-left p-3 font-semibold text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.biomarkers.map((b, i) => (
                              <React.Fragment key={i}>
                                <tr
                                  className={`transition-colors ${
                                    b.status === "high"
                                      ? "bg-red-500/5"
                                      : b.status === "low"
                                      ? "bg-amber-500/5"
                                      : "hover:bg-muted/30"
                                  } ${(!b.recommendation || b.status === "normal") ? "border-b last:border-b-0" : ""}`}
                                >
                                  <td className="p-3 font-medium text-foreground flex items-center gap-2">
                                    {getStatusIcon(b.status)}
                                    {b.name}
                                  </td>
                                  <td className={`p-3 font-semibold ${
                                    b.status === "high" ? "text-red-600" : b.status === "low" ? "text-amber-600" : "text-foreground"
                                  }`}>
                                    {b.value} {b.unit}
                                  </td>
                                  <td className="p-3 text-muted-foreground">{b.referenceRange} {b.unit}</td>
                                  <td className="p-3">{getStatusBadge(b.status)}</td>
                                </tr>
                                {b.recommendation && b.status !== "normal" && (
                                  <tr className="border-b last:border-b-0">
                                    <td colSpan={4} className="px-3 pb-3 pt-0">
                                      <div className="flex items-start gap-2 rounded-md bg-primary/5 p-3 border border-primary/10">
                                        <Heart className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        <span className="text-sm text-muted-foreground leading-relaxed">
                                          <strong className="text-foreground">Action:</strong> {b.recommendation}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                      {/* Possible Meanings */}
                      {report.summary.possibleMeanings && (
                        <div className="rounded-xl border p-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Possible Meanings
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {report.summary.possibleMeanings}
                          </p>
                        </div>
                      )}

                      {/* Recommendations */}
                      {report.summary.recommendations && (
                        <div className="rounded-xl border p-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Heart className="h-4 w-4 text-primary" />
                            Recommendations
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {report.summary.recommendations}
                          </p>
                        </div>
                      )}

                      {/* When to Consult */}
                      {report.summary.whenToConsult && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                            <Stethoscope className="h-4 w-4" />
                            When to Consult a Doctor
                          </div>
                          <p className="text-xs text-red-600/70 leading-relaxed">
                            {report.summary.whenToConsult}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Summary Stats */}
                    <div className="flex flex-wrap gap-3">
                      {normals.length > 0 && (
                        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs font-semibold text-emerald-600">{normals.length} values within normal range</span>
                        </div>
                      )}
                      {abnormals.length > 0 && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-xs font-semibold text-red-600">{abnormals.length} values need attention</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
