"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Sunset, Moon, Coffee } from "lucide-react";

export default function PatientSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/patient/dashboard");
        if (res.ok) {
          const json = await res.json();
          setSchedules(json.upcomingSchedules || []);
        }
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const groupedSchedules = {
    morning: schedules.filter((s) => s.timeOfDay === "morning"),
    afternoon: schedules.filter((s) => s.timeOfDay === "afternoon"),
    evening: schedules.filter((s) => s.timeOfDay === "evening"),
    night: schedules.filter((s) => s.timeOfDay === "night"),
  };

  const timeBlocks = [
    { id: "morning", title: "Morning", icon: Coffee, data: groupedSchedules.morning, color: "text-warning" },
    { id: "afternoon", title: "Afternoon", icon: Sun, data: groupedSchedules.afternoon, color: "text-primary" },
    { id: "evening", title: "Evening / Bedtime", icon: Sunset, data: groupedSchedules.evening, color: "text-secondary-dark" },
    { id: "night", title: "Night", icon: Moon, data: groupedSchedules.night, color: "text-foreground" },
  ].filter(block => block.data.length > 0); // Only show sections that have medicines scheduled

  if (loading) {
    return <div className="h-96 rounded-xl bg-card shimmer"></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Daily Schedule</h1>
        <p className="text-muted-foreground">
          Your medicine routine organized by time of day.
        </p>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted/50 p-4">
              <Sun className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No medicines scheduled</h3>
            <p className="mt-2 text-muted-foreground">
              When you upload a prescription, your schedule will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {timeBlocks.map((block) => (
            <Card key={block.id} className="overflow-hidden border-border shadow-sm">
              <div className="flex items-center gap-3 border-b bg-muted/30 px-6 py-4">
                <block.icon className={`h-5 w-5 ${block.color}`} />
                <h3 className="text-lg font-semibold">{block.title}</h3>
                <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {block.data.length} {block.data.length === 1 ? "medicine" : "medicines"}
                </span>
              </div>
              <CardContent className="p-0">
                {block.data.length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                    Nothing scheduled.
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {block.data.map((med, idx) => (
                      <li key={idx} className="flex flex-col gap-1 px-6 py-4 hover:bg-muted/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{med.medicineName}</span>
                          <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {med.dose}
                          </span>
                        </div>
                        {med.instruction && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {med.instruction}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
