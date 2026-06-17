import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { MedicineAnalysis } from "./gemini.functions";
import { lookupMedicineRegistry, type RegistryMedicine, type RegistryManufacturer } from "./registry.functions";

export interface VerificationResult {
  analysis: MedicineAnalysis;
  medicineFound: boolean;
  medicineRecord: RegistryMedicine | null;
  manufacturerRecord: RegistryManufacturer | null;
  manufacturerFound: boolean;
  manufacturerMatches: boolean;
  expiryValid: boolean | null;
  similarityPercent: number;
  trustScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  reasons: { ok: boolean; text: string }[];
  sources: string[];
}

function norm(s: string) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function parseExpiry(s: string): Date | null {
  if (!s) return null;
  const m1 = s.match(/^(\d{4})[-/](\d{1,2})/);
  if (m1) return new Date(Number(m1[1]), Number(m1[2]) - 1, 28);
  const m2 = s.match(/^(\d{1,2})[-/](\d{4})/);
  if (m2) return new Date(Number(m2[2]), Number(m2[1]) - 1, 28);
  const m3 = s.match(/([A-Za-z]{3})[\s/-]*(\d{4})/);
  if (m3) {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const idx = months.indexOf(m3[1].toLowerCase());
    if (idx >= 0) return new Date(Number(m3[2]), idx, 28);
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export async function verifyExtractedMedicine(analysis: MedicineAnalysis): Promise<VerificationResult> {
  const lookup = await lookupMedicineRegistry({
    data: { medicineName: analysis.medicineName, manufacturer: analysis.manufacturer },
  });

  const medicineRecord = lookup.medicine;
  const manufacturerRecord = lookup.manufacturer;

  const medicineFound = !!medicineRecord && medicineRecord.approvalStatus !== "Withdrawn";
  const manufacturerFound = !!manufacturerRecord && manufacturerRecord.verificationStatus === "Verified";
  const manufacturerMatches = !!(medicineRecord && manufacturerRecord &&
    norm(medicineRecord.manufacturer) === norm(manufacturerRecord.manufacturerName));

  const expDate = parseExpiry(analysis.expiryDate);
  const expiryValid = expDate ? expDate.getTime() > Date.now() : null;

  const similarityPercent = Math.max(0, Math.min(100, Math.round(analysis.packaging.similarityPercent || 0)));

  const medicinePts = medicineFound ? 40 : 0;
  const mfgPts = manufacturerFound && manufacturerMatches ? 20 : manufacturerFound ? 12 : 0;
  const packPts = Math.round((similarityPercent / 100) * 40);
  let trustScore = medicinePts + mfgPts + packPts;
  if (expiryValid === false) trustScore = Math.max(0, trustScore - 25);
  trustScore = Math.max(0, Math.min(100, trustScore));

  const riskLevel: VerificationResult["riskLevel"] = trustScore >= 80 ? "LOW" : trustScore >= 50 ? "MEDIUM" : "HIGH";

  const sources = Array.from(new Set([
    medicineRecord?.source,
    manufacturerRecord?.source,
  ].filter(Boolean) as string[]));

  const reasons: { ok: boolean; text: string }[] = [
    { ok: medicineFound, text: medicineFound
      ? `Medicine "${medicineRecord!.medicineName}" found in ${medicineRecord!.source} registry`
      : "Medicine not found in CDSCO / OpenFDA / DrugSetu registries" },
    { ok: manufacturerFound, text: manufacturerFound
      ? `Manufacturer "${manufacturerRecord!.manufacturerName}" verified via ${manufacturerRecord!.source}`
      : "Manufacturer not verified" },
    { ok: manufacturerMatches, text: manufacturerMatches ? "Manufacturer matches registry record" : "Manufacturer does not match medicine record" },
    { ok: similarityPercent >= 75, text: `Packaging similarity ${similarityPercent}%` },
    ...(expiryValid !== null ? [{ ok: expiryValid, text: expiryValid ? `Expiry date valid (${analysis.expiryDate})` : `Expired or invalid date (${analysis.expiryDate})` }] : []),
  ];

  const result: VerificationResult = {
    analysis,
    medicineFound,
    medicineRecord,
    manufacturerRecord,
    manufacturerFound,
    manufacturerMatches,
    expiryValid,
    similarityPercent,
    trustScore,
    riskLevel,
    reasons,
    sources,
  };

  // Log history (best-effort)
  try {
    const db = getDb();
    await addDoc(collection(db, "verifications"), {
      medicineName: analysis.medicineName,
      manufacturer: analysis.manufacturer,
      trustScore,
      riskLevel,
      similarityPercent,
      medicineFound,
      manufacturerFound,
      sources,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Verification log failed", e);
  }

  return result;
}

// Registry no longer needs Firestore seeding (data sourced from CDSCO / OpenFDA / DrugSetu).
export async function isRegistrySeeded(): Promise<boolean> {
  return true;
}

export async function seedRegistry(): Promise<void> {
  // no-op
}
