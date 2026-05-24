import { DesignService } from '../design.service';

// ──────────────────────────────────────────────
// File Matcher
// ──────────────────────────────────────────────
// Matches design file names to spreadsheet rows using
// three strategies: exact slug, pattern-based, and fuzzy.

export type MatchResult = {
  designName: string;
  fileName: string | null;
  matchType: 'exact' | 'pattern' | 'fuzzy' | 'none';
  confidence: number; // 0-1
};

/**
 * Match design names to file names from an uploaded ZIP.
 */
export function matchDesignFiles(
  designNames: string[],
  fileNames: string[],
  filenamePatterns?: Map<string, string>
): MatchResult[] {
  const available = new Set(fileNames);
  const results: MatchResult[] = [];

  for (const name of designNames) {
    const slug = DesignService.generateSlug(name);

    // Strategy 1: Exact slug match
    const exactMatch = findExactMatch(slug, available);
    if (exactMatch) {
      available.delete(exactMatch);
      results.push({ designName: name, fileName: exactMatch, matchType: 'exact', confidence: 1 });
      continue;
    }

    // Strategy 2: Filename pattern match
    const pattern = filenamePatterns?.get(name.toLowerCase());
    if (pattern) {
      const patternMatch = findPatternMatch(pattern, available);
      if (patternMatch) {
        available.delete(patternMatch);
        results.push({ designName: name, fileName: patternMatch, matchType: 'pattern', confidence: 0.95 });
        continue;
      }
    }

    // Strategy 3: Fuzzy match
    const fuzzyMatch = findFuzzyMatch(slug, available);
    if (fuzzyMatch) {
      available.delete(fuzzyMatch.fileName);
      results.push({ designName: name, fileName: fuzzyMatch.fileName, matchType: 'fuzzy', confidence: fuzzyMatch.confidence });
      continue;
    }

    // No match
    results.push({ designName: name, fileName: null, matchType: 'none', confidence: 0 });
  }

  return results;
}

/**
 * Find a file whose name starts with the design slug.
 */
function findExactMatch(slug: string, available: Set<string>): string | null {
  for (const fileName of available) {
    const normalized = normalizeFileName(fileName);
    if (normalized.startsWith(slug)) {
      return fileName;
    }
  }
  return null;
}

/**
 * Find a file matching a filename pattern from the spreadsheet.
 * Patterns use [platform] and [size] as wildcards.
 */
function findPatternMatch(pattern: string, available: Set<string>): string | null {
  const basePattern = pattern
    .replace(/\[platform\]/gi, '')
    .replace(/\[size\]/gi, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const slug = normalizeFileName(basePattern);

  for (const fileName of available) {
    const normalized = normalizeFileName(fileName);
    if (normalized.startsWith(slug) || normalized.includes(slug)) {
      return fileName;
    }
  }
  return null;
}

/**
 * Find the closest fuzzy match using Levenshtein distance.
 * Only returns matches with > 60% similarity.
 */
function findFuzzyMatch(
  slug: string,
  available: Set<string>
): { fileName: string; confidence: number } | null {
  let bestMatch: { fileName: string; confidence: number } | null = null;

  for (const fileName of available) {
    const normalized = normalizeFileName(fileName);
    const distance = levenshteinDistance(slug, normalized);
    const maxLen = Math.max(slug.length, normalized.length);
    const confidence = maxLen > 0 ? 1 - distance / maxLen : 0;

    if (confidence > 0.6 && (!bestMatch || confidence > bestMatch.confidence)) {
      bestMatch = { fileName, confidence };
    }
  }

  return bestMatch;
}

/**
 * Strip extension, lowercase, replace non-alphanumeric with hyphens.
 */
function normalizeFileName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, '') // strip extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Levenshtein distance between two strings.
 * Standard DP implementation.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,     // deletion
        dp[i][j - 1] + 1,     // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}
