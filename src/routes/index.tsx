import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ScanLine,
  Database,
  Sparkles,
  Upload,
  FileSearch,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Pill,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "MediChain — Verify medicine authenticity with AI" },
      { name: "description", content: "Upload a medicine pack. MediChain checks it against CDSCO & OpenFDA registries and analyzes packaging with AI to detect counterfeits." },
    ],
  }),
});

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                AI + CDSCO + OpenFDA registries
              </div>
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                Spot counterfeit medicines <span className="text-gradient">in seconds.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                MediChain extracts medicine details from any pack photo, cross-checks them against approved drug registries, and uses Gemini Vision to score packaging authenticity.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/verify">
                  <Button size="lg" className="gradient-hero text-white shadow-lg hover:opacity-95">
                    <ScanLine className="mr-2 h-4 w-4" /> Verify a medicine
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline">How it works</Button>
                </Link>
              </div>
              <div className="flex gap-6 pt-4 text-sm text-muted-foreground">
                <Stat label="Registry medicines" value="50+" />
                <Stat label="Verified manufacturers" value="30+" />
                <Stat label="Avg. trust score" value="92%" />
              </div>
            </div>

            <div className="relative">
              <div className="glass rounded-3xl p-6 shadow-[var(--shadow-elevated)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live verification
                  </div>
                  <span className="text-xs text-muted-foreground">Sample</span>
                </div>
                <div className="rounded-2xl bg-primary text-white p-5">
                  <div className="text-xs uppercase tracking-wider opacity-70">Trust Score</div>
                  <div className="text-6xl font-bold mt-1">92%</div>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs text-emerald-200">
                    <CheckCircle2 className="h-3 w-3" /> LOW RISK
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {[
                    "Medicine found in approved registry",
                    "Manufacturer verified (CDSCO)",
                    "Packaging similarity 88%",
                    "Expiry date valid (2027-09)",
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute -bottom-6 -right-4 hidden sm:block glass rounded-2xl px-4 py-3 text-sm shadow-lg">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-accent" />
                  <span className="font-medium">Avg. analysis</span>
                  <span className="text-muted-foreground">3.2s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">A trustworthy verdict, every time</h2>
          <p className="mt-3 text-muted-foreground">Four layers of verification combine into one explainable trust score.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Feature icon={Pill} title="Medicine registry" desc="Cross-checked against CDSCO-approved drug records." />
          <Feature icon={Building2} title="Manufacturer match" desc="Verifies the listed maker exists & is licensed." />
          <Feature icon={Sparkles} title="Gemini Vision" desc="Analyzes logo, fonts, layout & print quality." />
          <Feature icon={Gauge} title="Explainable score" desc="See exactly why a pack scored what it did." />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">From photo to verdict in three steps</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Step n={1} icon={Upload} title="Upload pack image" desc="Drag-drop or snap a photo of the medicine strip or box." />
            <Step n={2} icon={FileSearch} title="AI extraction" desc="Gemini Vision reads name, manufacturer, batch & expiry." />
            <Step n={3} icon={ShieldCheck} title="Trust score" desc="We verify registry + manufacturer + packaging and score it." />
          </div>
          <div className="mt-10 text-center">
            <Link to="/verify">
              <Button size="lg" className="gradient-hero text-white">
                Try it now <ScanLine className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* DATA SOURCES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="glass rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-accent">
              <Database className="h-4 w-4" /> Real, public datasets
            </div>
            <h2 className="text-3xl font-bold mt-3">Backed by official drug registries</h2>
            <p className="mt-3 text-muted-foreground">We import and continuously sync approved-medicine datasets so verification reflects the actual regulatory landscape.</p>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> CDSCO Approved Drug Registry (India)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> OpenFDA Drug Data (USA)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> DrugSetu Medicine Database</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <RegistryCard title="CDSCO" subtitle="50+ medicines indexed" />
            <RegistryCard title="OpenFDA" subtitle="Continuously synced" />
            <RegistryCard title="Manufacturers" subtitle="30+ verified" />
            <RegistryCard title="Reference images" subtitle="Admin-managed" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: typeof ShieldCheck; title: string; desc: string }) {
  return (
    <div className="glass rounded-2xl p-6 transition-transform hover:-translate-y-1">
      <div className="grid h-11 w-11 place-items-center rounded-xl gradient-hero text-white">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold text-lg">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Step({ n, icon: Icon, title, desc }: { n: number; icon: typeof Upload; title: string; desc: string }) {
  return (
    <div className="glass rounded-2xl p-6 relative">
      <div className="absolute top-4 right-4 text-5xl font-bold text-primary/10">{n}</div>
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold text-lg">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function RegistryCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 hover:shadow-md transition-shadow">
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
    </div>
  );
}
