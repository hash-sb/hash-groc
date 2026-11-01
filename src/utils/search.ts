/**
 * Utility functions for word-prefix based search across the application.
 * Matches words from their start (e.g. "mil" matches "Milk" and "Whole Milk",
 * but does NOT match "Buttermilk" or "Family Pack").
 */

/**
 * Splits text into normalized unicode words/tokens.
 */
export function extractWords(text: string): string[] {
  if (!text) return []
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
}

/**
 * Checks if a target string or array of strings (e.g. [item.name, item.category])
 * matches a search query by matching the start of words only.
 *
 * Every token in the query must match the start (prefix) of at least one word
 * in the target text.
 */
export function matchesWordPrefix(
  target: string | (string | undefined | null)[],
  query: string
): boolean {
  if (!query || !query.trim()) return true

  const queryTokens = extractWords(query)
  if (queryTokens.length === 0) return true

  const combinedTarget = Array.isArray(target)
    ? target.filter(Boolean).join(' ')
    : target || ''

  const targetWords = extractWords(combinedTarget)
  if (targetWords.length === 0) return false

  return queryTokens.every((qToken) =>
    targetWords.some((tWord) => tWord.startsWith(qToken))
  )
}

/**
 * Computes a relevance score for sorting matching results based on item name.
 * Higher score = higher priority in search results.
 */
export function scoreWordPrefixMatch(
  targetName: string,
  query: string
): number {
  const q = query.trim().toLowerCase()
  if (!q) return 0

  const nameLower = targetName.toLowerCase()
  if (nameLower === q) return 100
  if (nameLower.startsWith(q)) return 80

  const nameWords = extractWords(targetName)
  if (nameWords.length > 0 && nameWords[0].startsWith(q)) return 70
  if (nameWords.some((w) => w.startsWith(q))) return 50

  return 10
}
