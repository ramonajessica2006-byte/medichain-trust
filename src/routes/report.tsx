import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { initFirebase, getDb } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/report")({
  component: ReportPage,
  head: () => ({
    meta: [
      { title: "Report Fake Medicine — MediChain" },
      { name: "description", content: "Report suspected counterfeit or fake medicine for admin review." },
    ],
  }),
});

const schema = z.object({
  medicineName: z.string().trim().min(1, "Medicine name required").max(200),
  manufacturer: z.string().trim().max(200).optional(),
  batchNumber: z.string().trim().max(100).optional(),
  pharmacy: z.string().trim().max(200).optional(),
  location: z.string().trim().max(200).optional(),
  reporterName: z.string().trim().max(100).optional(),
  reporterContact: z.string().trim().max(200).optional(),
  description: z.string().trim().min(10, "Please describe the issue (min 10 chars)").max(2000),
});

function ReportPage() {
  const [form, setForm] = useState({
    medicineName: "",
    manufacturer: "",
    batchNumber: "",
    pharmacy: "",
    location: "",
    reporterName: "",
    reporterContact: "",
    description: "",
  });
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    try {
      await initFirebase();
      await addDoc(collection(getDb(), "reports"), {
        ...parsed.data,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      toast.success("Report submitted. Thank you for helping keep medicines safe.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold">Report Fake Medicine</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Help protect public health. Submit details about any suspected counterfeit, substandard, or
          mislabeled medicine. Reports are reviewed by our admin team.
        </p>

        {submitted ? (
          <div className="glass rounded-2xl p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold mb-2">Report received</h2>
            <p className="text-muted-foreground mb-4">
              Our admin team will review your submission. Thank you for contributing.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setForm({
                  medicineName: "", manufacturer: "", batchNumber: "", pharmacy: "",
                  location: "", reporterName: "", reporterContact: "", description: "",
                });
              }}
            >
              Submit another report
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Medicine name *">
                <Input required value={form.medicineName} onChange={(e) => setForm({ ...form, medicineName: e.target.value })} />
              </Field>
              <Field label="Manufacturer">
                <Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
              </Field>
              <Field label="Batch / Lot number">
                <Input value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
              </Field>
              <Field label="Pharmacy / Seller">
                <Input value={form.pharmacy} onChange={(e) => setForm({ ...form, pharmacy: e.target.value })} />
              </Field>
              <Field label="Location (city, state)">
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </Field>
              <Field label="Your contact (optional)">
                <Input placeholder="email or phone" value={form.reporterContact} onChange={(e) => setForm({ ...form, reporterContact: e.target.value })} />
              </Field>
            </div>
            <Field label="Your name (optional)">
              <Input value={form.reporterName} onChange={(e) => setForm({ ...form, reporterName: e.target.value })} />
            </Field>
            <Field label="Describe the issue *">
              <Textarea
                rows={5}
                required
                placeholder="What made you suspect this medicine? (packaging, effects, price, source, etc.)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            <Button type="submit" disabled={busy} className="w-full gradient-hero text-white">
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
              Submit report
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              For medical emergencies, contact your local poison control or emergency services immediately.
            </p>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
