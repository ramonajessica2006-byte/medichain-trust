import {
  collection,
  getDocs,
  query,
  where,
  limit,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { MedicineAnalysis } from "./gemini.functions";

export interface VerificationResult {
  analysis: MedicineAnalysis;
  medicineFound: boolean;
  medicineRecord: { medicineName: string; manufacturer: string; composition: string; category: string; approvalStatus: string } | null;
  manufacturerFound: boolean;
  manufacturerMatches: boolean;
  expiryValid: boolean | null;
  similarityPercent: number;
  trustScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  reasons: { ok: boolean; text: string }[];
}

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function parseExpiry(s: string): Date | null {
  if (!s) return null;
  // Accept YYYY-MM, MM/YYYY, MM-YYYY, MMM YYYY
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
  const db = getDb();
  const medsRef = collection(db, "medicines");
  const mfgRef = collection(db, "manufacturers");

  // Fetch all (datasets are small for hackathon scale); for prod use indexed queries
  const [medSnap, mfgSnap] = await Promise.all([getDocs(medsRef), getDocs(mfgRef)]);
  const medicines = medSnap.docs.map((d) => d.data() as { medicineName: string; manufacturer: string; composition: string; category: string; approvalStatus: string });
  const manufacturers = mfgSnap.docs.map((d) => d.data() as { manufacturerName: string; country: string; verificationStatus: string });

  const targetName = norm(analysis.medicineName);
  const targetMfg = norm(analysis.manufacturer);

  let medicineRecord = medicines.find((m) => norm(m.medicineName) === targetName) ?? null;
  if (!medicineRecord && targetName) {
    medicineRecord = medicines.find((m) => norm(m.medicineName).includes(targetName) || targetName.includes(norm(m.medicineName))) ?? null;
  }
  const medicineFound = !!medicineRecord && medicineRecord.approvalStatus !== "Withdrawn";

  const manufacturerRecord = manufacturers.find((m) => norm(m.manufacturerName) === targetMfg)
    ?? (targetMfg ? manufacturers.find((m) => norm(m.manufacturerName).includes(targetMfg) || targetMfg.includes(norm(m.manufacturerName))) : undefined);
  const manufacturerFound = !!manufacturerRecord && manufacturerRecord.verificationStatus === "Verified";

  const manufacturerMatches = !!(medicineRecord && manufacturerRecord && norm(medicineRecord.manufacturer) === norm(manufacturerRecord.manufacturerName));

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

  const reasons: { ok: boolean; text: string }[] = [
    { ok: medicineFound, text: medicineFound ? `Medicine "${medicineRecord!.medicineName}" found in approved registry` : "Medicine not found in approved registry" },
    { ok: manufacturerFound, text: manufacturerFound ? `Manufacturer "${manufacturerRecord!.manufacturerName}" verified` : "Manufacturer not verified" },
    { ok: manufacturerMatches, text: manufacturerMatches ? "Manufacturer matches registry record" : "Manufacturer does not match medicine record" },
    { ok: similarityPercent >= 75, text: `Packaging similarity ${similarityPercent}%` },
    ...(expiryValid !== null ? [{ ok: expiryValid, text: expiryValid ? `Expiry date valid (${analysis.expiryDate})` : `Expired or invalid date (${analysis.expiryDate})` }] : []),
  ];

  const result: VerificationResult = {
    analysis,
    medicineFound,
    medicineRecord,
    manufacturerFound,
    manufacturerMatches,
    expiryValid,
    similarityPercent,
    trustScore,
    riskLevel,
    reasons,
  };

  // Log history (best-effort)
  try {
    await addDoc(collection(db, "verifications"), {
      medicineName: analysis.medicineName,
      manufacturer: analysis.manufacturer,
      trustScore,
      riskLevel,
      similarityPercent,
      medicineFound,
      manufacturerFound,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Verification log failed", e);
  }

  return result;
}

export async function isRegistrySeeded(): Promise<boolean> {
  const db = getDb();
  const snap = await getDocs(query(collection(db, "medicines"), limit(1)));
  return !snap.empty;
}

export async function seedRegistry(meds: { medicineName: string; manufacturer: string; composition: string; category: string; approvalStatus: string }[], mfgs: { manufacturerName: string; country: string; verificationStatus: string }[]) {
  const db = getDb();
  await Promise.all([
    ...meds.map((m) => addDoc(collection(db, "medicines"), m)),
    ...mfgs.map((m) => addDoc(collection(db, "manufacturers"), m)),
  ]);
}
