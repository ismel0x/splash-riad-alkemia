import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface NameValidationResult {
  valid: boolean;
  confidence: number;
  suggestion?: string;
  issues?: string[];
}

export async function validateFullName(fullName: string): Promise<NameValidationResult> {
  try {
    // Don't validate extremely short or long names via API
    if (fullName.length < 2 || fullName.length > 50) {
      return {
        valid: false,
        confidence: 0.9,
        issues: ["Name length is outside normal range"]
      };
    }

    const prompt = `Analyze if "${fullName}" is a plausible human full name. Consider:
- International naming conventions (Arabic, Berber, French, English, Spanish, etc.)
- Common name formats and structures
- Detect obvious fake entries, test data, or nonsense
- Cultural diversity in Morocco/Marrakech context

Respond in JSON format:
{
  "valid": boolean,
  "confidence": number (0-1),
  "suggestion": "corrected name if typo detected" or null,
  "issues": ["list of specific issues"] or []
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a name validation expert for a hospitality business in Morocco. Be culturally sensitive and inclusive while detecting obvious fake or test entries."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.1
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      valid: result.valid ?? true, // Default to valid if parsing fails
      confidence: Math.max(0, Math.min(1, result.confidence ?? 0.5)),
      suggestion: result.suggestion || undefined,
      issues: Array.isArray(result.issues) ? result.issues : []
    };

  } catch (error) {
    console.error("OpenAI name validation error:", error);
    
    // Graceful fallback - don't block registration
    return {
      valid: true,
      confidence: 0.5,
      issues: ["AI validation temporarily unavailable"]
    };
  }
}

// Simple cache to avoid repeated API calls for the same name
const validationCache = new Map<string, { result: NameValidationResult; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function validateFullNameWithCache(fullName: string): Promise<NameValidationResult> {
  const normalizedName = fullName.trim().toLowerCase();
  const cached = validationCache.get(normalizedName);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }

  const result = await validateFullName(fullName);
  validationCache.set(normalizedName, { result, timestamp: Date.now() });
  
  return result;
}