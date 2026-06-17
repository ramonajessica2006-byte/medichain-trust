import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Upload, ScanLine, ShieldCheck, Database, Sparkles, Gauge } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  component: HowItWorks,
  head: () => ({
    meta: [
      { title: "How It Works — MediChain" },
      { name: "description", content: "How MediChain verifies medicines: AI extraction, registry checks, manufacturer validation, and packaging similarity scoring." },
    ],
  }),
});

function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold">How MediChain works</h1>
          <p className="mt-4 text-muted-foreground">A transparent, four-layer verification pipeline — each layer contributes to the final trust score.</p>
        </div>

        <ol className="mt-12 space-y-6">
          <Item n={1} icon={Upload} title="You upload a pack photo" desc="Drag a photo of the medicine strip or box. We never store your image unless you're an admin uploading reference assets." />
          <Item n={2} icon={Sparkles} title="Gemini Vision extracts details" desc="Our prompt extracts medicine name, manufacturer, batch number, expiry date, and active composition from the pack, plus a description of the packaging." />
          <Item n={3} icon={Database} title="Registry checks" desc="We match the extracted medicine and manufacturer against approved-drug datasets imported from CDSCO, OpenFDA, and DrugSetu, and confirm the manufacturer/medicine pair is legitimate." />
          <Item n={4} icon={ShieldCheck} title="AI packaging analysis" desc="Gemini compares logo placement, fonts, alignment, colors, print quality, and missing regulatory information against genuine reference packs." />
        </ol>

        <section className="mt-16 glass rounded-3xl p-8">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Gauge className="h-5 w-5 text-accent" /> The trust score</h2>
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <Box title="Medicine in registry" value="40 pts" />
            <Box title="Manufacturer verified" value="20 pts" />
            <Box title="Packaging similarity" value="40 pts" />
          </div>
          <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
            <Risk color="bg-emerald-500" label="80–100" risk="Low risk" />
            <Risk color="bg-amber-500" label="50–79" risk="Medium risk" />
            <Risk color="bg-red-500" label="0–49" risk="High risk" />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">An expired pack subtracts up to 25 points from the final score. Every score ships with a per-criterion breakdown so you understand exactly why.</p>
        </section>

        <div className="mt-12 text-center">
          <Link to="/verify">
            <Button size="lg" className="gradient-hero text-white">
              <ScanLine className="mr-2 h-4 w-4" /> Verify a medicine now
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Item({ n, icon: Icon, title, desc }: { n: number; icon: typeof Upload; title: string; desc: string }) {
  return (
    <li className="glass rounded-2xl p-6 flex gap-5">
      <div className="shrink-0">
        <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-hero text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-2 text-center text-xs text-muted-foreground">Step {n}</div>
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="mt-1 text-muted-foreground">{desc}</p>
      </div>
    </li>
  );
}

function Box({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-2xl font-bold text-gradient">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{title}</div>
    </div>
  );
}

function Risk({ color, label, risk }: { color: string; label: string; risk: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <div>
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{risk}</div>
      </div>
    </div>
  );
}
