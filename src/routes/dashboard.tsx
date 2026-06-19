import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { initFirebase, getDb } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, limit, updateDoc } from "firebase/firestore";
import { SEED_MEDICINES, ALL_MANUFACTURERS } from "@/lib/seed-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, Building2, History, BarChart3, Database, Trash2, Plus, Loader2, ShieldCheck, AlertTriangle, CheckCircle2, Flag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Admin Dashboard — MediChain" }] }),
});

interface Medicine { id: string; medicineName: string; manufacturer: string; composition: string; category: string; approvalStatus: string; }
interface Manufacturer { id: string; manufacturerName: string; country: string; verificationStatus: string; }
interface Verification { id: string; medicineName: string; manufacturer: string; trustScore: number; riskLevel: string; createdAt?: { seconds: number } | null; }
interface Report { id: string; medicineName: string; manufacturer?: string; batchNumber?: string; pharmacy?: string; location?: string; reporterName?: string; reporterContact?: string; description: string; status: string; createdAt?: { seconds: number } | null; }

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [history, setHistory] = useState<Verification[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [busy, setBusy] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  const load = async () => {
    await initFirebase();
    const db = getDb();
    const [meds, mfgs, vers, reps] = await Promise.all([
      getDocs(collection(db, "medicines")),
      getDocs(collection(db, "manufacturers")),
      getDocs(query(collection(db, "verifications"), orderBy("createdAt", "desc"), limit(50))).catch(() => null),
      getDocs(query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(100))).catch(() => null),
    ]);
    setMedicines(meds.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Medicine, "id">) })));
    setManufacturers(mfgs.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Manufacturer, "id">) })));
    if (vers) setHistory(vers.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Verification, "id">) })));
    if (reps) setReports(reps.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Report, "id">) })));
    setDataLoaded(true);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const seed = async () => {
    setBusy(true);
    try {
      const db = getDb();
      await Promise.all([
        ...SEED_MEDICINES.map((m) => addDoc(collection(db, "medicines"), m)),
        ...ALL_MANUFACTURERS.map((m) => addDoc(collection(db, "manufacturers"), m)),
      ]);
      toast.success(`Imported ${SEED_MEDICINES.length} medicines & ${ALL_MANUFACTURERS.length} manufacturers`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally { setBusy(false); }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  const lowRisk = history.filter((h) => h.riskLevel === "LOW").length;
  const medRisk = history.filter((h) => h.riskLevel === "MEDIUM").length;
  const highRisk = history.filter((h) => h.riskLevel === "HIGH").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-7xl w-full px-6 py-10">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><ShieldCheck className="h-7 w-7 text-accent" /> Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Signed in as {user.email}</p>
          </div>
          {dataLoaded && medicines.length === 0 && (
            <Button onClick={seed} disabled={busy} className="gradient-hero text-white">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
              Import sample registry
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <StatCard icon={Pill} label="Medicines" value={medicines.length} />
          <StatCard icon={Building2} label="Manufacturers" value={manufacturers.length} />
          <StatCard icon={History} label="Verifications" value={history.length} />
          <StatCard icon={BarChart3} label="Avg trust" value={history.length ? `${Math.round(history.reduce((a, h) => a + h.trustScore, 0) / history.length)}%` : "—"} />
          <StatCard icon={Flag} label="Pending reports" value={reports.filter((r) => r.status === "pending").length} />
        </div>

        <div className="glass rounded-2xl p-6 mb-8">
          <h3 className="font-semibold mb-4">Risk distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            <RiskBar color="bg-emerald-500" label="Low" count={lowRisk} total={history.length || 1} />
            <RiskBar color="bg-amber-500" label="Medium" count={medRisk} total={history.length || 1} />
            <RiskBar color="bg-red-500" label="High" count={highRisk} total={history.length || 1} />
          </div>
        </div>

        <Tabs defaultValue={reports.some((r) => r.status === "pending") ? "reports" : "medicines"}>
          <TabsList>
            <TabsTrigger value="medicines">Medicines</TabsTrigger>
            <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
            <TabsTrigger value="history">Verification History</TabsTrigger>
            <TabsTrigger value="reports">
              Reports
              {reports.filter((r) => r.status === "pending").length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] h-4 min-w-4 px-1">
                  {reports.filter((r) => r.status === "pending").length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="medicines">
            <MedicinesTab medicines={medicines} reload={load} />
          </TabsContent>
          <TabsContent value="manufacturers">
            <ManufacturersTab manufacturers={manufacturers} reload={load} />
          </TabsContent>
          <TabsContent value="history">
            <HistoryTab history={history} />
          </TabsContent>
          <TabsContent value="reports">
            <ReportsTab reports={reports} reload={load} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Pill; label: string; value: string | number }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}

function RiskBar({ color, label, count, total }: { color: string; label: string; count: number; total: number }) {
  const pct = Math.round((count / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${color}`} /> {label}</span>
        <span className="font-medium">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MedicinesTab({ medicines, reload }: { medicines: Medicine[]; reload: () => Promise<void> }) {
  const [form, setForm] = useState({ medicineName: "", manufacturer: "", composition: "", category: "", approvalStatus: "Approved" });
  const [busy, setBusy] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(getDb(), "medicines"), form);
      toast.success("Medicine added");
      setForm({ medicineName: "", manufacturer: "", composition: "", category: "", approvalStatus: "Approved" });
      await reload();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this medicine?")) return;
    await deleteDoc(doc(getDb(), "medicines", id));
    await reload();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3 mt-4">
      <form onSubmit={add} className="glass rounded-2xl p-5 space-y-3 lg:col-span-1">
        <h3 className="font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Add medicine</h3>
        <Input placeholder="Medicine name" required value={form.medicineName} onChange={(e) => setForm({ ...form, medicineName: e.target.value })} />
        <Input placeholder="Manufacturer" required value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
        <Input placeholder="Composition" value={form.composition} onChange={(e) => setForm({ ...form, composition: e.target.value })} />
        <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <Button type="submit" disabled={busy} className="w-full gradient-hero text-white">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
        </Button>
      </form>

      <div className="glass rounded-2xl p-5 lg:col-span-2 max-h-[600px] overflow-auto">
        <h3 className="font-semibold mb-3">Registry ({medicines.length})</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground border-b">
            <tr><th className="py-2">Name</th><th>Manufacturer</th><th>Category</th><th></th></tr>
          </thead>
          <tbody>
            {medicines.map((m) => (
              <tr key={m.id} className="border-b last:border-0 hover:bg-secondary/40">
                <td className="py-2 font-medium">{m.medicineName}</td>
                <td className="text-muted-foreground">{m.manufacturer}</td>
                <td className="text-muted-foreground">{m.category}</td>
                <td className="text-right">
                  <button onClick={() => remove(m.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {medicines.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No medicines yet. Import the sample registry above.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ManufacturersTab({ manufacturers, reload }: { manufacturers: Manufacturer[]; reload: () => Promise<void> }) {
  const [form, setForm] = useState({ manufacturerName: "", country: "", verificationStatus: "Verified" });
  const [busy, setBusy] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(getDb(), "manufacturers"), form);
      toast.success("Manufacturer added");
      setForm({ manufacturerName: "", country: "", verificationStatus: "Verified" });
      await reload();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this manufacturer?")) return;
    await deleteDoc(doc(getDb(), "manufacturers", id));
    await reload();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3 mt-4">
      <form onSubmit={add} className="glass rounded-2xl p-5 space-y-3 lg:col-span-1">
        <h3 className="font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Add manufacturer</h3>
        <Input placeholder="Manufacturer name" required value={form.manufacturerName} onChange={(e) => setForm({ ...form, manufacturerName: e.target.value })} />
        <Input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <Button type="submit" disabled={busy} className="w-full gradient-hero text-white">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
        </Button>
      </form>

      <div className="glass rounded-2xl p-5 lg:col-span-2 max-h-[600px] overflow-auto">
        <h3 className="font-semibold mb-3">Manufacturers ({manufacturers.length})</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground border-b">
            <tr><th className="py-2">Name</th><th>Country</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {manufacturers.map((m) => (
              <tr key={m.id} className="border-b last:border-0 hover:bg-secondary/40">
                <td className="py-2 font-medium">{m.manufacturerName}</td>
                <td className="text-muted-foreground">{m.country}</td>
                <td>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${m.verificationStatus === "Verified" ? "bg-emerald-100 text-emerald-700" : m.verificationStatus === "Blacklisted" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    {m.verificationStatus}
                  </span>
                </td>
                <td className="text-right">
                  <button onClick={() => remove(m.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HistoryTab({ history }: { history: Verification[] }) {
  return (
    <div className="glass rounded-2xl p-5 mt-4 max-h-[600px] overflow-auto">
      <h3 className="font-semibold mb-3">Recent verifications ({history.length})</h3>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-muted-foreground border-b">
          <tr><th className="py-2">Medicine</th><th>Manufacturer</th><th>Score</th><th>Risk</th><th>When</th></tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id} className="border-b last:border-0 hover:bg-secondary/40">
              <td className="py-2 font-medium">{h.medicineName || "—"}</td>
              <td className="text-muted-foreground">{h.manufacturer || "—"}</td>
              <td className="font-semibold">{h.trustScore}%</td>
              <td>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${h.riskLevel === "LOW" ? "bg-emerald-100 text-emerald-700" : h.riskLevel === "MEDIUM" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                  {h.riskLevel}
                </span>
              </td>
              <td className="text-muted-foreground text-xs">{h.createdAt ? new Date(h.createdAt.seconds * 1000).toLocaleString() : "—"}</td>
            </tr>
          ))}
          {history.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No verifications yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function ReportsTab({ reports, reload }: { reports: Report[]; reload: () => Promise<void> }) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const setStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      await updateDoc(doc(getDb(), "reports", id), { status });
      toast.success(`Marked as ${status}`);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    await deleteDoc(doc(getDb(), "reports", id));
    await reload();
  };

  return (
    <div className="glass rounded-2xl p-5 mt-4 max-h-[700px] overflow-auto">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-500" /> Fake medicine reports ({reports.length})
      </h3>
      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="rounded-xl border p-4 bg-card/40">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold">{r.medicineName}</h4>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                    r.status === "pending" ? "bg-amber-100 text-amber-700" :
                    r.status === "verified" ? "bg-red-100 text-red-700" :
                    r.status === "dismissed" ? "bg-gray-200 text-gray-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>{r.status}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                  {r.manufacturer && <span>Mfg: {r.manufacturer}</span>}
                  {r.batchNumber && <span>Batch: {r.batchNumber}</span>}
                  {r.pharmacy && <span>Pharmacy: {r.pharmacy}</span>}
                  {r.location && <span>Location: {r.location}</span>}
                </div>
                <p className="text-sm mt-2 whitespace-pre-wrap">{r.description}</p>
                {(r.reporterName || r.reporterContact) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Reported by {r.reporterName || "anonymous"}{r.reporterContact ? ` · ${r.reporterContact}` : ""}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleString() : "—"}
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button size="sm" variant="outline" disabled={busyId === r.id || r.status === "verified"} onClick={() => setStatus(r.id, "verified")}>
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Confirm fake
                </Button>
                <Button size="sm" variant="outline" disabled={busyId === r.id || r.status === "dismissed"} onClick={() => setStatus(r.id, "dismissed")}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Dismiss
                </Button>
                <button onClick={() => remove(r.id)} className="text-red-500 hover:text-red-700 text-xs flex items-center justify-center gap-1 mt-1">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">No reports yet.</div>
        )}
      </div>
    </div>
  );
}
