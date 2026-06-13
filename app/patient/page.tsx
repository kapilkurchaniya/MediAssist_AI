"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable, Column } from "@/components/ui/data-table";
import { Pill, FileText, CalendarClock, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/utils";

export default function PatientDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/patient/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-md bg-muted shimmer"></div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-card shimmer"></div>
          ))}
        </div>
        <div className="h-64 rounded-xl bg-card shimmer"></div>
      </div>
    );
  }

  const handleMarkTaken = async (scheduleId: string, currentStatus: boolean) => {
    // Optimistic update
    setData((prev: any) => {
      const updatedSchedules = prev.upcomingSchedules.map((s: any) => {
        if (s._id === scheduleId) {
          return { ...s, takenToday: !currentStatus };
        }
        return s;
      });
      return { ...prev, upcomingSchedules: updatedSchedules };
    });

    try {
      const res = await fetch("/api/patient/medicine-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId,
          status: !currentStatus ? "taken" : "missed",
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (error) {
      console.error("Failed to mark medicine:", error);
      // Revert optimistic update
      setData((prev: any) => {
        const revertedSchedules = prev.upcomingSchedules.map((s: any) => {
          if (s._id === scheduleId) {
            return { ...s, takenToday: currentStatus };
          }
          return s;
        });
        return { ...prev, upcomingSchedules: revertedSchedules };
      });
    }
  };

  const scheduleColumns: Column<any>[] = [
    {
      header: "Taken",
      cell: (item) => (
        <input
          type="checkbox"
          checked={item.takenToday || false}
          onChange={() => handleMarkTaken(item._id, item.takenToday || false)}
          className="h-5 w-5 cursor-pointer accent-primary"
        />
      ),
    },
    {
      header: "Medicine",
      cell: (item) => (
        <span className={item.takenToday ? "font-semibold text-muted-foreground line-through" : "font-semibold"}>
          {item.medicineName}
        </span>
      ),
    },
    {
      header: "Dose",
      accessorKey: "dose",
    },
    {
      header: "Time",
      cell: (item) => <span className="capitalize">{item.timeOfDay}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">
            Here is a summary of your medicines and upcoming schedule.
          </p>
        </div>
        <Link href={ROUTES.PATIENT_UPLOAD}>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Prescription
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Active Medicines"
          value={data?.metrics?.activeMedicines || 0}
          icon={Pill}
        />
        <MetricCard
          title="Total Prescriptions"
          value={data?.metrics?.totalPrescriptions || 0}
          icon={FileText}
        />
        <MetricCard
          title="Today's Doses"
          value={data?.upcomingSchedules?.length || 0}
          icon={CalendarClock}
          className={data?.upcomingSchedules?.length > 0 ? "border-primary/50 bg-primary/5" : ""}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Today's Schedule
          </h2>
          <DataTable
            data={data?.upcomingSchedules || []}
            columns={scheduleColumns}
            emptyMessage="No medicines scheduled for today."
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Recent Prescriptions
          </h2>
          <div className="rounded-md border bg-card">
            {data?.recentPrescriptions?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No prescriptions found.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {data?.recentPrescriptions?.map((p: any) => (
                  <li key={p._id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{formatDate(p.createdAt)}</p>
                      <p className="text-sm text-muted-foreground">
                        {p.extractedData?.doctorName || "Unknown Doctor"}
                      </p>
                    </div>
                    <Badge variant={p.status === "approved" ? "default" : "secondary"}>
                      {p.status.replace("_", " ")}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
