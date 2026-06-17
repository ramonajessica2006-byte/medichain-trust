import { createServerFn } from "@tanstack/react-start";

interface AnalyzeInput {
  imageBase64: string;
  mimeType: string;
  referenceBase64?: string;
  referenceMimeType?: string;
}

export interface MedicineAnalysis {
  medicineName: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  composition: string;
  packaging: {
    logoConsistency: number;
    fontConsistency: number;
    layoutConsistency: number;
    printingQuality: number;
    missingInformation: string[];
    similarityPercent: number;
    notes: string;
  };
  rawText: string;
}

const PROMPT = `You are a pharmaceutical packaging authenticity inspector.

Analyze the uploaded medicine package image. If a reference genuine image is also provided, compare the uploaded image against it.

Return ONLY a valid JSON object (no markdown, no commentary) with this exact shape:
{
  "medicineName": string,           // brand name printed on pack, "" if unreadable
  "manufacturer": string,           // manufacturer/marketer printed on pack, "" if unreadable
  "batchNumber": string,            // batch/lot number, "" if not visible
  "expiryDate": string,             // expiry in YYYY-MM format if possible, else as printed
  "composition": string,            // active ingredient(s) + strength, "" if unreadable
  "packaging": {
    "logoConsistency": number,        // 0-100
    "fontConsistency": number,        // 0-100
    "layoutConsistency": number,      // 0-100
    "printingQuality": number,        // 0-100
    "missingInformation": string[],   // e.g. ["Batch No", "Mfg License"]
    "similarityPercent": number,      // 0-100 overall similarity to reference (if no reference, estimate authenticity based on print/design quality)
    "notes": string                   // 1-2 sentence explanation
  },
  "rawText": string                 // all readable text concatenated
}

Be strict but fair. If the package looks counterfeit (blurry logos, wrong fonts, off colors, missing regulatory info), reflect that with low scores.`;

export const analyzeMedicineImage = createServerFn({ method: "POST" })
  .inputValidator((d: AnalyzeInput) => d)
  .handler(async ({ data }): Promise<MedicineAnalysis> => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY not configured");

    const parts: Array<Record<string, unknown>> = [{ text: PROMPT }];
    parts.push({ inline_data: { mime_type: data.mimeType, data: data.imageBase64 } });
    if (data.referenceBase64 && data.referenceMimeType) {
      parts.push({ text: "Reference genuine image follows:" });
      parts.push({ inline_data: { mime_type: data.referenceMimeType, data: data.referenceBase64 } });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${t.slice(0, 300)}`);
    }
    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    let parsed: MedicineAnalysis;
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : ({} as MedicineAnalysis);
    }
    // Defensive defaults
    parsed.packaging ??= {
      logoConsistency: 0,
      fontConsistency: 0,
      layoutConsistency: 0,
      printingQuality: 0,
      missingInformation: [],
      similarityPercent: 0,
      notes: "",
    };
    parsed.medicineName ??= "";
    parsed.manufacturer ??= "";
    parsed.batchNumber ??= "";
    parsed.expiryDate ??= "";
    parsed.composition ??= "";
    parsed.rawText ??= "";
    return parsed;
  });
