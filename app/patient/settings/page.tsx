"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function PatientSettingsPage() {
  const [profile, setProfile] = useState<any>({
    age: "",
    gender: "",
    allergies: "",
    otherAllergy: "",
    medicalConditions: "",
    otherCondition: "",
    emergencyContact: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const json = await res.json();
          if (json.profile) {
            const dbAllergies = json.profile.allergies?.join(", ") || "";
            const isStandardAllergy = ["", "None", "Penicillin", "Peanuts", "Dust"].includes(dbAllergies);
            
            const dbConditions = json.profile.medicalConditions?.join(", ") || "";
            const isStandardCondition = ["", "None", "Diabetes", "Hypertension", "Asthma"].includes(dbConditions);

            setProfile({
              age: json.profile.age || "",
              gender: json.profile.gender || "",
              allergies: isStandardAllergy ? dbAllergies : "Other",
              otherAllergy: isStandardAllergy ? "" : dbAllergies,
              medicalConditions: isStandardCondition ? dbConditions : "Other",
              otherCondition: isStandardCondition ? "" : dbConditions,
              emergencyContact: json.profile.emergencyContact || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const finalAllergies = profile.allergies === "Other" ? profile.otherAllergy : profile.allergies;
      const finalConditions = profile.medicalConditions === "Other" ? profile.otherCondition : profile.medicalConditions;

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: profile.age ? Number(profile.age) : undefined,
          gender: profile.gender,
          allergies: finalAllergies && finalAllergies !== "None" ? finalAllergies.split(",").map((a: string) => a.trim()) : [],
          medicalConditions: finalConditions && finalConditions !== "None" ? finalConditions.split(",").map((c: string) => c.trim()) : [],
          emergencyContact: profile.emergencyContact,
        }),
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="h-96 rounded-xl bg-card shimmer"></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your medical profile and personal information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
          <CardDescription>This helps our AI provide more accurate safety checks.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={profile.age}
                  onChange={handleChange}
                  placeholder="e.g. 32"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="allergies">Known Allergies</Label>
              <select
                id="allergies"
                name="allergies"
                value={profile.allergies}
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="None">None</option>
                <option value="Penicillin">Penicillin</option>
                <option value="Peanuts">Peanuts</option>
                <option value="Dust">Dust</option>
                <option value="Other">Other (Please specify)</option>
              </select>
              {profile.allergies === "Other" && (
                <Input
                  id="otherAllergy"
                  name="otherAllergy"
                  value={profile.otherAllergy}
                  onChange={handleChange}
                  placeholder="Please specify your allergies (comma separated)"
                  className="mt-2"
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="medicalConditions">Medical Conditions</Label>
              <select
                id="medicalConditions"
                name="medicalConditions"
                value={profile.medicalConditions}
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="None">None</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Hypertension">Hypertension</option>
                <option value="Asthma">Asthma</option>
                <option value="Other">Other (Please specify)</option>
              </select>
              {profile.medicalConditions === "Other" && (
                <Input
                  id="otherCondition"
                  name="otherCondition"
                  value={profile.otherCondition}
                  onChange={handleChange}
                  placeholder="Please specify your conditions (comma separated)"
                  className="mt-2"
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                name="emergencyContact"
                value={profile.emergencyContact}
                onChange={handleChange}
                placeholder="e.g. +91 9876543210"
              />
            </div>

            {message && (
              <p className={`text-sm ${message.includes("success") ? "text-success" : "text-danger"}`}>
                {message}
              </p>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
