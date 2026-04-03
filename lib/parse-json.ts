/**
 * Parse JSON from LLM response, handling markdown code fences
 */
export function parseJSONFromLLM<T>(text: string): T {
  // Remove markdown code fences if present
  let cleaned = text.trim()

  // Handle ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```')) {
    // Find the end of the first line (which may contain "json" or other language hint)
    const firstNewline = cleaned.indexOf('\n')
    if (firstNewline !== -1) {
      cleaned = cleaned.slice(firstNewline + 1)
    }
    // Remove closing fence
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3)
    }
  }

  cleaned = cleaned.trim()

  return JSON.parse(cleaned) as T
}
