import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-gradient-to-b from-transparent to-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg gradient-hero text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-semibold">MediChain</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            AI-powered authenticity verification for medicines, backed by CDSCO &amp; OpenFDA registries.
          </p>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-2">Data Sources</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>CDSCO Approved Drug Registry</li>
            <li>OpenFDA Drug Data</li>
            <li>DrugSetu Medicine Database</li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-2">Disclaimer</h4>
          <p className="text-muted-foreground">
            MediChain provides risk-assessment guidance only. Always consult licensed pharmacists and verify with regulatory authorities for medical decisions.
          </p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MediChain. Built for safer medicine.
      </div>
    </footer>
  );
}
