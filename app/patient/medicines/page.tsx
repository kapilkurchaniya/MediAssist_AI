"use client";

import { useEffect, useState } from "react";
import { DataTable, Column } from "@/components/ui/data-table";

// In a real app, this would hit an API endpoint that queries the MedicineSchedule or PrescriptionMedicine models.
// For Phase 2 scaffolding, we'll fetch dashboard data which has upcomingSchedules and deduce medicines from there.
// Alternatively, we can leave it empty pending Phase 3 data extraction.
export default function PatientMedicinesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/patient/dashboard");
        if (res.ok) {
          const json = await res.json();
          // Extract unique medicines from schedules
          const medMap = new Map();
          json.upcomingSchedules?.forEach((s: any) => {
            if (!medMap.has(s.medicineName)) {
              medMap.set(s.medicineName, {
                name: s.medicineName,
                dose: s.dose,
                instruction: s.instruction || "Take as directed",
                status: s.status
              });
            }
          });
          setData(Array.from(medMap.values()));
        }
      } catch (error) {
        console.error("Failed to fetch medicines:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const columns: Column<any>[] = [
    {
      header: "Medicine Name",
      cell: (item) => <div className="font-semibold text-primary">{item.name}</div>,
    },
    {
      header: "Dose",
      accessorKey: "dose",
    },
    {
      header: "Instructions",
      accessorKey: "instruction",
    },
    {
      header: "Status",
      cell: (item) => <span className="capitalize text-muted-foreground">{item.status}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Medicines</h1>
        <p className="text-muted-foreground">
          A unified list of all your active medications extracted from your prescriptions.
        </p>
      </div>

      {loading ? (
        <div className="h-64 rounded-xl bg-card shimmer"></div>
      ) : (
        <DataTable
          data={data}
          columns={columns}
          emptyMessage="No active medicines found."
        />
      )}
    </div>
  );
}
