import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Upload, Image as ImageIcon, X, Loader2, ShieldCheck, ScanLine, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { analyzeMedicineImage } from "@/lib/gemini.functions";
import { initFirebase } from "@/lib/firebase";
import { verifyExtractedMedicine, type VerificationResult } from "@/lib/verification";

export const Route = createFileRoute("/verify")({
  component: VerifyPage,
  head: () => ({
    meta: [
      { title: "Verify Medicine — MediChain" },
      { name: "description", content: "Upload a medicine pack to verify it against approved drug registries and AI packaging analysis." },
    ],
  }),
});

function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const onFile = useCallback((f: File | null | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please upload an image."); return; }
    if (f.size > 8 * 1024 * 1024) { toast.error("Image too large (max 8MB)."); return; }
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    onFile(e.dataTransfer.files?.[0]);
  };

  const analyze = async () => {
    if (!file || !preview) return;
    setLoading(true);
    try {
      const base64 = preview.split(",")[1];
      const analysis = await analyzeMedicineImage({
        data: { imageBase64: base64, mimeType: file.type },
      });
      await initFirebase();
      const verification = await verifyExtractedMedicine(analysis);
      setResult(verification);
      toast.success("Verification complete");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => { setFile(null); setPreview(null); setResult(null); };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-6xl w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Verify a medicine</h1>
          <p className="text-muted-foreground mt-2">Upload a clear photo of the medicine strip or box. We'll extract details and score authenticity.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Upload */}
          <div className="lg:col-span-2">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`glass rounded-2xl p-6 transition-all ${dragging ? "ring-2 ring-accent" : ""}`}
            >
              {preview ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-secondary aspect-video grid place-items-center">
                    <img src={preview} alt="Medicine preview" className="max-h-full max-w-full object-contain" />
                    <button onClick={clear} className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{file?.name}</div>
                  <Button onClick={analyze} disabled={loading} className="w-full gradient-hero text-white" size="lg">
                    {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</>) : (<><ScanLine className="mr-2 h-4 w-4" /> Analyze pack</>)}
                  </Button>
                </div>
              ) : (
                <label className="block cursor-pointer text-center py-12 rounded-xl border-2 border-dashed border-border hover:border-accent transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-hero text-white">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="mt-4 font-medium">Drag &amp; drop your medicine pack</div>
                  <div className="text-sm text-muted-foreground">or click to browse · PNG, JPG up to 8MB</div>
                </label>
              )}
            </div>

            <div className="mt-4 glass rounded-2xl p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground"><ImageIcon className="h-4 w-4" /> Tips for best results</div>
              <ul className="mt-2 space-y-1 list-disc pl-5">
                <li>Capture the entire pack with clear lighting</li>
                <li>Ensure brand name, batch & expiry are readable</li>
                <li>Avoid heavy glare and shadows</li>
              </ul>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {!result && !loading && (
              <div className="glass rounded-2xl p-12 text-center text-muted-foreground h-full grid place-items-center">
                <div>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
                    <ShieldCheck className="h-7 w-7 text-primary/40" />
                  </div>
                  <p className="mt-4">Upload a pack to see verification results here.</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="glass rounded-2xl p-12 text-center h-full grid place-items-center">
                <div>
                  <Loader2 className="h-10 w-10 mx-auto animate-spin text-accent" />
                  <p className="mt-4 font-medium">Running AI analysis</p>
                  <p className="text-sm text-muted-foreground mt-1">Extracting text · checking registries · scoring packaging</p>
                </div>
              </div>
            )}

            {result && <ResultsCard r={result} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ResultsCard({ r }: { r: VerificationResult }) {
  const riskColor = r.riskLevel === "LOW" ? "bg-emerald-500" : r.riskLevel === "MEDIUM" ? "bg-amber-500" : "bg-red-500";
  const riskBg = r.riskLevel === "LOW" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : r.riskLevel === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200";

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-6 gradient-hero text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider opacity-70">Trust Score</div>
              <div className="text-6xl font-bold mt-1">{r.trustScore}%</div>
              <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${riskBg}`}>
                <span className={`h-2 w-2 rounded-full ${riskColor}`} />
                {r.riskLevel} RISK
              </div>
            </div>
            <Gauge score={r.trustScore} />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Extracted details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Medicine" value={r.analysis.medicineName || "—"} />
              <Field label="Manufacturer" value={r.analysis.manufacturer || "—"} />
              <Field label="Batch No." value={r.analysis.batchNumber || "—"} />
              <Field label="Expiry" value={r.analysis.expiryDate || "—"} />
              <Field label="Composition" value={r.analysis.composition || "—"} className="col-span-2" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Why this score</h3>
            <ul className="space-y-2">
              {r.reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {reason.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                  <span>{reason.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Packaging analysis</h3>
            <div className="grid grid-cols-2 gap-3">
              <Bar label="Logo consistency" value={r.analysis.packaging.logoConsistency} />
              <Bar label="Font consistency" value={r.analysis.packaging.fontConsistency} />
              <Bar label="Layout consistency" value={r.analysis.packaging.layoutConsistency} />
              <Bar label="Printing quality" value={r.analysis.packaging.printingQuality} />
            </div>
            {r.analysis.packaging.missingInformation?.length > 0 && (
              <div className="mt-3 rounded-lg border bg-amber-50 border-amber-200 p-3 text-sm text-amber-800 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>Missing on pack: {r.analysis.packaging.missingInformation.join(", ")}</div>
              </div>
            )}
            {r.analysis.packaging.notes && (
              <p className="mt-3 text-sm text-muted-foreground italic">"{r.analysis.packaging.notes}"</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-lg bg-secondary/60 p-3 ${className}`}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-medium mt-0.5 break-words">{value}</div>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{v}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-full gradient-hero transition-all" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function Gauge({ score }: { score: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" className="shrink-0">
      <circle cx="45" cy="45" r={r} stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
      <circle cx="45" cy="45" r={r} stroke="white" strokeWidth="8" fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 45 45)" />
      <text x="45" y="50" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">{score}</text>
    </svg>
  );
}
