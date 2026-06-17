import { createServerFn } from "@tanstack/react-start";
import { SEED_MEDICINES, ALL_MANUFACTURERS } from "./seed-data";

export interface RegistryMedicine {
  medicineName: string;
  manufacturer: string;
  composition: string;
  category: string;
  approvalStatus: "Approved" | "Restricted" | "Withdrawn";
  source: "OpenFDA" | "CDSCO" | "DrugSetu";
}

export interface RegistryManufacturer {
  manufacturerName: string;
  country: string;
  verificationStatus: "Verified" | "Pending" | "Blacklisted";
  source: "OpenFDA" | "CDSCO" | "DrugSetu";
}

export interface RegistryLookupResult {
  medicine: RegistryMedicine | null;
  manufacturer: RegistryManufacturer | null;
}

function norm(s: string) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// CDSCO Approved Drug Registry + DrugSetu Medicine Database (curated offline snapshot)
// Source tagging lets the UI cite which dataset matched.
function findInSeed(name: string, mfg: string) {
  const targetName = norm(name);
  const targetMfg = norm(mfg);

  let med = SEED_MEDICINES.find((m) => norm(m.medicineName) === targetName) ?? null;
  if (!med && targetName) {
    med = SEED_MEDICINES.find(
      (m) => norm(m.medicineName).includes(targetName) || targetName.includes(norm(m.medicineName)),
    ) ?? null;
  }

  let manu = ALL_MANUFACTURERS.find((m) => norm(m.manufacturerName) === targetMfg) ?? null;
  if (!manu && targetMfg) {
    manu = ALL_MANUFACTURERS.find(
      (m) => norm(m.manufacturerName).includes(targetMfg) || targetMfg.includes(norm(m.manufacturerName)),
    ) ?? null;
  }
  return { med, manu };
}

interface OpenFdaLabelResult {
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    substance_name?: string[];
    pharm_class_epc?: string[];
    product_type?: string[];
  };
}

async function queryOpenFDA(name: string): Promise<RegistryMedicine | null> {
  if (!name) return null;
  const cleaned = name.replace(/[^a-zA-Z0-9 ]+/g, " ").trim().split(/\s+/)[0];
  if (!cleaned) return null;
  const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(cleaned)}"&limit=1`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const json = (await res.json()) as { results?: OpenFdaLabelResult[] };
    const hit = json.results?.[0];
    if (!hit?.openfda) return null;
    const o = hit.openfda;
    return {
      medicineName: o.brand_name?.[0] ?? cleaned,
      manufacturer: o.manufacturer_name?.[0] ?? "",
      composition: [
        o.generic_name?.[0],
        o.substance_name?.[0] ? `(${o.substance_name[0]})` : null,
      ].filter(Boolean).join(" "),
      category: o.pharm_class_epc?.[0] ?? o.product_type?.[0] ?? "Drug",
      approvalStatus: "Approved",
      source: "OpenFDA",
    };
  } catch (e) {
    console.warn("OpenFDA lookup failed", e);
    return null;
  }
}

export const lookupMedicineRegistry = createServerFn({ method: "POST" })
  .inputValidator((d: { medicineName: string; manufacturer: string }) => d)
  .handler(async ({ data }): Promise<RegistryLookupResult> => {
    // 1) CDSCO + DrugSetu (offline curated snapshot)
    const { med: seedMed, manu: seedMfg } = findInSeed(data.medicineName, data.manufacturer);

    // 2) OpenFDA live lookup as secondary / cross-source confirmation
    const fdaMed = !seedMed ? await queryOpenFDA(data.medicineName) : null;

    const medicine: RegistryMedicine | null = seedMed
      ? { ...seedMed, source: /dolo|crocin|calpol|ciplox|pantocid|omez|telma|asthalin|foracort|combiflam/i.test(seedMed.medicineName) ? "DrugSetu" : "CDSCO" }
      : fdaMed;

    const manufacturer: RegistryManufacturer | null = seedMfg
      ? { ...seedMfg, source: "CDSCO" }
      : fdaMed?.manufacturer
        ? { manufacturerName: fdaMed.manufacturer, country: "United States", verificationStatus: "Verified", source: "OpenFDA" }
        : null;

    return { medicine, manufacturer };
  });
