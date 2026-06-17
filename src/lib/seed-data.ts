// Real medicines from CDSCO Approved Drug Registry & OpenFDA datasets
export interface SeedMedicine {
  medicineName: string;
  manufacturer: string;
  composition: string;
  category: string;
  approvalStatus: "Approved" | "Restricted" | "Withdrawn";
}

export interface SeedManufacturer {
  manufacturerName: string;
  country: string;
  verificationStatus: "Verified" | "Pending" | "Blacklisted";
}

export const SEED_MANUFACTURERS: SeedManufacturer[] = [
  { manufacturerName: "Sun Pharmaceutical Industries Ltd", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Cipla Ltd", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Dr. Reddy's Laboratories", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Lupin Limited", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Aurobindo Pharma", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Zydus Lifesciences", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Torrent Pharmaceuticals", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Glenmark Pharmaceuticals", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Mankind Pharma", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Alkem Laboratories", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Abbott India", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "GlaxoSmithKline Pharmaceuticals", country: "United Kingdom", verificationStatus: "Verified" },
  { manufacturerName: "Pfizer Inc", country: "United States", verificationStatus: "Verified" },
  { manufacturerName: "Novartis AG", country: "Switzerland", verificationStatus: "Verified" },
  { manufacturerName: "Sanofi India", country: "France", verificationStatus: "Verified" },
  { manufacturerName: "Johnson & Johnson", country: "United States", verificationStatus: "Verified" },
  { manufacturerName: "AstraZeneca Pharma India", country: "United Kingdom", verificationStatus: "Verified" },
  { manufacturerName: "Bayer Pharmaceuticals", country: "Germany", verificationStatus: "Verified" },
  { manufacturerName: "Merck Sharp & Dohme", country: "United States", verificationStatus: "Verified" },
  { manufacturerName: "Roche India", country: "Switzerland", verificationStatus: "Verified" },
];

export const SEED_MEDICINES: SeedMedicine[] = [
  { medicineName: "Crocin Advance", manufacturer: "GlaxoSmithKline Pharmaceuticals", composition: "Paracetamol 500 mg", category: "Analgesic", approvalStatus: "Approved" },
  { medicineName: "Dolo 650", manufacturer: "Micro Labs Limited", composition: "Paracetamol 650 mg", category: "Analgesic", approvalStatus: "Approved" },
  { medicineName: "Calpol 500", manufacturer: "GlaxoSmithKline Pharmaceuticals", composition: "Paracetamol 500 mg", category: "Analgesic", approvalStatus: "Approved" },
  { medicineName: "Augmentin 625 Duo", manufacturer: "GlaxoSmithKline Pharmaceuticals", composition: "Amoxicillin 500 mg + Clavulanic Acid 125 mg", category: "Antibiotic", approvalStatus: "Approved" },
  { medicineName: "Azithral 500", manufacturer: "Alembic Pharmaceuticals", composition: "Azithromycin 500 mg", category: "Antibiotic", approvalStatus: "Approved" },
  { medicineName: "Amoxil 500", manufacturer: "GlaxoSmithKline Pharmaceuticals", composition: "Amoxicillin 500 mg", category: "Antibiotic", approvalStatus: "Approved" },
  { medicineName: "Ciplox 500", manufacturer: "Cipla Ltd", composition: "Ciprofloxacin 500 mg", category: "Antibiotic", approvalStatus: "Approved" },
  { medicineName: "Pantocid 40", manufacturer: "Sun Pharmaceutical Industries Ltd", composition: "Pantoprazole 40 mg", category: "Antacid", approvalStatus: "Approved" },
  { medicineName: "Pan 40", manufacturer: "Alkem Laboratories", composition: "Pantoprazole 40 mg", category: "Antacid", approvalStatus: "Approved" },
  { medicineName: "Omez 20", manufacturer: "Dr. Reddy's Laboratories", composition: "Omeprazole 20 mg", category: "Antacid", approvalStatus: "Approved" },
  { medicineName: "Rantac 150", manufacturer: "Sun Pharmaceutical Industries Ltd", composition: "Ranitidine 150 mg", category: "Antacid", approvalStatus: "Restricted" },
  { medicineName: "Metformin 500", manufacturer: "Cipla Ltd", composition: "Metformin Hydrochloride 500 mg", category: "Antidiabetic", approvalStatus: "Approved" },
  { medicineName: "Glycomet 500", manufacturer: "USV Private Limited", composition: "Metformin Hydrochloride 500 mg", category: "Antidiabetic", approvalStatus: "Approved" },
  { medicineName: "Janumet 50/500", manufacturer: "Merck Sharp & Dohme", composition: "Sitagliptin 50 mg + Metformin 500 mg", category: "Antidiabetic", approvalStatus: "Approved" },
  { medicineName: "Telma 40", manufacturer: "Glenmark Pharmaceuticals", composition: "Telmisartan 40 mg", category: "Antihypertensive", approvalStatus: "Approved" },
  { medicineName: "Amlong 5", manufacturer: "Micro Labs Limited", composition: "Amlodipine 5 mg", category: "Antihypertensive", approvalStatus: "Approved" },
  { medicineName: "Ecosprin 75", manufacturer: "USV Private Limited", composition: "Aspirin 75 mg", category: "Antiplatelet", approvalStatus: "Approved" },
  { medicineName: "Atorva 10", manufacturer: "Zydus Lifesciences", composition: "Atorvastatin 10 mg", category: "Statin", approvalStatus: "Approved" },
  { medicineName: "Rosuvas 10", manufacturer: "Sun Pharmaceutical Industries Ltd", composition: "Rosuvastatin 10 mg", category: "Statin", approvalStatus: "Approved" },
  { medicineName: "Allegra 120", manufacturer: "Sanofi India", composition: "Fexofenadine 120 mg", category: "Antihistamine", approvalStatus: "Approved" },
  { medicineName: "Cetzine 10", manufacturer: "Dr. Reddy's Laboratories", composition: "Cetirizine 10 mg", category: "Antihistamine", approvalStatus: "Approved" },
  { medicineName: "Levocet 5", manufacturer: "Mankind Pharma", composition: "Levocetirizine 5 mg", category: "Antihistamine", approvalStatus: "Approved" },
  { medicineName: "Montair LC", manufacturer: "Cipla Ltd", composition: "Montelukast 10 mg + Levocetirizine 5 mg", category: "Antiasthmatic", approvalStatus: "Approved" },
  { medicineName: "Asthalin Inhaler", manufacturer: "Cipla Ltd", composition: "Salbutamol 100 mcg/dose", category: "Bronchodilator", approvalStatus: "Approved" },
  { medicineName: "Foracort 200", manufacturer: "Cipla Ltd", composition: "Formoterol 6 mcg + Budesonide 200 mcg", category: "Bronchodilator", approvalStatus: "Approved" },
  { medicineName: "Thyronorm 50", manufacturer: "Abbott India", composition: "Levothyroxine 50 mcg", category: "Hormone", approvalStatus: "Approved" },
  { medicineName: "Eltroxin 50", manufacturer: "GlaxoSmithKline Pharmaceuticals", composition: "Levothyroxine 50 mcg", category: "Hormone", approvalStatus: "Approved" },
  { medicineName: "Shelcal 500", manufacturer: "Torrent Pharmaceuticals", composition: "Calcium Carbonate 1250 mg + Vitamin D3 250 IU", category: "Supplement", approvalStatus: "Approved" },
  { medicineName: "Becosules", manufacturer: "Pfizer Inc", composition: "Vitamin B Complex + Vitamin C", category: "Supplement", approvalStatus: "Approved" },
  { medicineName: "Zincovit", manufacturer: "Apex Laboratories", composition: "Multivitamins + Multiminerals", category: "Supplement", approvalStatus: "Approved" },
  { medicineName: "Combiflam", manufacturer: "Sanofi India", composition: "Ibuprofen 400 mg + Paracetamol 325 mg", category: "Analgesic", approvalStatus: "Approved" },
  { medicineName: "Brufen 400", manufacturer: "Abbott India", composition: "Ibuprofen 400 mg", category: "Analgesic", approvalStatus: "Approved" },
  { medicineName: "Voveran 50", manufacturer: "Novartis AG", composition: "Diclofenac Sodium 50 mg", category: "Analgesic", approvalStatus: "Approved" },
  { medicineName: "Zerodol SP", manufacturer: "Ipca Laboratories", composition: "Aceclofenac 100 mg + Paracetamol 325 mg + Serratiopeptidase 15 mg", category: "Analgesic", approvalStatus: "Approved" },
  { medicineName: "Norflox 400", manufacturer: "Cipla Ltd", composition: "Norfloxacin 400 mg", category: "Antibiotic", approvalStatus: "Approved" },
  { medicineName: "Metrogyl 400", manufacturer: "J.B. Chemicals & Pharmaceuticals", composition: "Metronidazole 400 mg", category: "Antibiotic", approvalStatus: "Approved" },
  { medicineName: "Sporanox 100", manufacturer: "Johnson & Johnson", composition: "Itraconazole 100 mg", category: "Antifungal", approvalStatus: "Approved" },
  { medicineName: "Fluconazole 150", manufacturer: "Cipla Ltd", composition: "Fluconazole 150 mg", category: "Antifungal", approvalStatus: "Approved" },
  { medicineName: "Aciloc 150", manufacturer: "Cadila Pharmaceuticals", composition: "Ranitidine 150 mg", category: "Antacid", approvalStatus: "Restricted" },
  { medicineName: "Domstal 10", manufacturer: "Torrent Pharmaceuticals", composition: "Domperidone 10 mg", category: "Antiemetic", approvalStatus: "Approved" },
  { medicineName: "Emeset 4", manufacturer: "Cipla Ltd", composition: "Ondansetron 4 mg", category: "Antiemetic", approvalStatus: "Approved" },
  { medicineName: "Losar 50", manufacturer: "Unichem Laboratories", composition: "Losartan Potassium 50 mg", category: "Antihypertensive", approvalStatus: "Approved" },
  { medicineName: "Concor 5", manufacturer: "Merck Sharp & Dohme", composition: "Bisoprolol Fumarate 5 mg", category: "Antihypertensive", approvalStatus: "Approved" },
  { medicineName: "Clopilet 75", manufacturer: "Sun Pharmaceutical Industries Ltd", composition: "Clopidogrel 75 mg", category: "Antiplatelet", approvalStatus: "Approved" },
  { medicineName: "Glimer 1", manufacturer: "Aristo Pharmaceuticals", composition: "Glimepiride 1 mg", category: "Antidiabetic", approvalStatus: "Approved" },
  { medicineName: "Galvus 50", manufacturer: "Novartis AG", composition: "Vildagliptin 50 mg", category: "Antidiabetic", approvalStatus: "Approved" },
  { medicineName: "Xarelto 10", manufacturer: "Bayer Pharmaceuticals", composition: "Rivaroxaban 10 mg", category: "Anticoagulant", approvalStatus: "Approved" },
  { medicineName: "Eliquis 5", manufacturer: "Pfizer Inc", composition: "Apixaban 5 mg", category: "Anticoagulant", approvalStatus: "Approved" },
  { medicineName: "Sinarest", manufacturer: "Centaur Pharmaceuticals", composition: "Paracetamol 500 mg + Phenylephrine 10 mg + Chlorpheniramine 2 mg", category: "Cold & Flu", approvalStatus: "Approved" },
  { medicineName: "Vicks Action 500", manufacturer: "Procter & Gamble Health", composition: "Paracetamol 500 mg + Phenylephrine 10 mg + Caffeine 32 mg", category: "Cold & Flu", approvalStatus: "Approved" },
];

// Additional manufacturers referenced in seed medicines but not in primary list above
export const EXTRA_MANUFACTURERS: SeedManufacturer[] = [
  { manufacturerName: "Micro Labs Limited", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Alembic Pharmaceuticals", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "USV Private Limited", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Ipca Laboratories", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "J.B. Chemicals & Pharmaceuticals", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Cadila Pharmaceuticals", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Unichem Laboratories", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Aristo Pharmaceuticals", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Apex Laboratories", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Centaur Pharmaceuticals", country: "India", verificationStatus: "Verified" },
  { manufacturerName: "Procter & Gamble Health", country: "United States", verificationStatus: "Verified" },
];

export const ALL_MANUFACTURERS = [...SEED_MANUFACTURERS, ...EXTRA_MANUFACTURERS];
