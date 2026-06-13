"use client";

import { useEffect, useState } from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PatientPrescriptionsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/prescriptions");
        if (res.ok) {
          const json = await res.json();
          setData(json.prescriptions || []);
        }
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prescription? This will also remove any generated medicine schedules.")) {
      return;
    }
    try {
      const res = await fetch(`/api/prescriptions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setData((prev) => prev.filter((item) => item._id !== id));
      } else {
        const errorData = await res.json();
        alert(`Failed to delete: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to delete prescription:", error);
      alert("An error occurred while deleting the prescription.");
    }
  };

  const columns: Column<any>[] = [
    {
      header: "Date",
      cell: (item) => formatDate(item.createdAt),
    },
    {
      header: "Doctor",
      cell: (item) => <div className="font-medium">{item.doctorId?.fullName || item.extractedData?.doctorName || "Unknown"}</div>,
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge
          variant={item.status === "approved" ? "default" : "secondary"}
          className="capitalize"
        >
          {item.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      header: "Safety Risk",
      cell: (item) => {
        const risk = item.risk?.level || "low";
        return (
          <span className={`capitalize font-semibold risk-${risk}`}>
            {risk}
          </span>
        );
      },
    },
    {
      header: "Actions",
      cell: (item) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete(item._id)}
          className="text-danger hover:text-danger hover:bg-danger/10"
          title="Delete Prescription"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Prescriptions</h1>
        <p className="text-muted-foreground">
          View all your uploaded and digitized prescriptions.
        </p>
      </div>

      {loading ? (
        <div className="h-96 rounded-xl bg-card shimmer"></div>
      ) : (
        <DataTable
          data={data}
          columns={columns}
          emptyMessage="You have not uploaded any prescriptions yet."
        />
      )}
    </div>
  );
}
