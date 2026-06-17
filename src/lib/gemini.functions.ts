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

export type AnalyzeMedicineImageResult =
  | { ok: true; analysis: MedicineAnalysis }
  | { ok: false; code: "MISSING_API_KEY" | "QUOTA_EXCEEDED" | "AI_SERVICE_ERROR" | "INVALID_AI_RESPONSE"; message: string };

function emptyAnalysis(notes = "AI analysis was unavailable."): MedicineAnalysis {
  return {
    medicineName: "",
    manufacturer: "",
    batchNumber: "",
    expiryDate: "",
    composition: "",
    packaging: {
      logoConsistency: 0,
      fontConsistency: 0,
      layoutConsistency: 0,
      printingQuality: 0,
      missingInformation: [],
      similarityPercent: 0,
      notes,
    },
    rawText: "",
  };
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
  .handler(async ({ data }): Promise<AnalyzeMedicineImageResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return {
        ok: false,
        code: "MISSING_API_KEY",
        message: "Lovable AI is not configured. Please try again later.",
      };
    }

    const content: Array<Record<string, unknown>> = [
      { type: "text", text: PROMPT },
      { type: "image_url", image_url: { url: `data:${data.mimeType};base64,${data.imageBase64}` } },
    ];
    if (data.referenceBase64 && data.referenceMimeType) {
      content.push({ type: "text", text: "Reference genuine image follows:" });
      content.push({
        type: "image_url",
        image_url: { url: `data:${data.referenceMimeType};base64,${data.referenceBase64}` },
      });
    }

    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content }],
          response_format: { type: "json_object" },
        }),
      });
    } catch (error) {
      console.error("Lovable AI request failed", error);
      return {
        ok: false,
        code: "AI_SERVICE_ERROR",
        message: "AI analysis is temporarily unavailable. Please try again in a moment.",
      };
    }

    if (!res.ok) {
      const t = await res.text();
      console.error(`Lovable AI error ${res.status}:`, t.slice(0, 500));
      if (res.status === 429) {
        return {
          ok: false,
          code: "QUOTA_EXCEEDED",
          message: "AI rate limit reached. Please wait a moment and try again.",
        };
      }
      if (res.status === 402) {
        return {
          ok: false,
          code: "QUOTA_EXCEEDED",
          message: "AI credits exhausted. Please add credits to continue.",
        };
      }
      return {
        ok: false,
        code: "AI_SERVICE_ERROR",
        message: "AI analysis failed. Please try again with a clearer image.",
      };
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: MedicineAnalysis;
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      try {
        parsed = m ? JSON.parse(m[0]) : emptyAnalysis("The AI response could not be read.");
      } catch (error) {
        console.error("Invalid AI JSON response", error);
        return {
          ok: false,
          code: "INVALID_AI_RESPONSE",
          message: "AI analysis returned an unreadable result. Please try again with a clearer image.",
        };
      }
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
    return { ok: true, analysis: parsed };
  });
