import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface AIReadingResult {
    success: boolean;
    value: number | null;
    confidence: "high" | "low";
    message: string;
}

export const AIService = {
    /**
     * Mérőóra állás leolvasása képből
     * @param base64Image A kép base64 formátumban
     */
    async recognizeMeterReading(base64Image: string): Promise<AIReadingResult> {
        try {
            // 1. Modell inicializálása (Gemini 2.5 Flash - gyors és pontos képfeldolgozásra)
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
        Te egy precíz mérőóra-leolvasó szakértő vagy. 
        A mellékelt képen egy mérőóra látható.
        Feladatod: Olvasd le az aktuális mérőóra-állást (csak a számokat a tizedesvessző előtt).
        Válaszolj kizárólag egy JSON objektummal ebben a formátumban:
        { "value": number, "confidence": "high" | "low" }
        Ha nem látod tisztán a számokat, a confidence legyen "low".
        Ne adj semmilyen magyarázatot vagy extra szöveget, csak a tiszta JSON-t!
      `;

            // 2. Kép formázása az SDK számára
            const imageParts = [
                {
                    inlineData: {
                        data: base64Image.split(",")[1], // Levágjuk a "data:image/png;base64," részt
                        mimeType: "image/jpeg",
                    },
                },
            ];

            // 3. AI hívás
            const result = await model.generateContent([prompt, ...imageParts]);
            const response = await result.response;
            const text = response.text();

            // 4. JSON kinyerése a válaszból
            const cleanJson = text.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleanJson) as { value: number; confidence: "high" | "low" };

            return {
                success: true,
                value: parsed.value,
                confidence: parsed.confidence,
                message: parsed.confidence === "high" ? "Sikeres leolvasás" : "A kép nem elég tiszta, ellenőrizd az értéket!",
            };
        } catch (error) {
            console.error("AI Recognition Error:", error);
            return {
                success: false,
                value: null,
                confidence: "low",
                message: "Nem sikerült feldolgozni a képet.",
            };
        }
    },
};