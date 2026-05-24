import type { Design } from '@/lib/admin/repositories';

// ──────────────────────────────────────────────
// Template Engine
// ──────────────────────────────────────────────
// Replaces {{placeholder}} tokens in listing templates
// with values from a design record. Pure function, no side effects.

export type TemplatePlaceholders = Record<string, string>;

const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;

/**
 * Build the placeholder map from a design record.
 * Each key matches a {{token}} in a template string.
 */
export function buildPlaceholders(design: Design): TemplatePlaceholders {
  return {
    title: design.title,
    description: design.description ?? '',
    collection: design.collection ?? '',
    slug: design.slug,
    who: design.target_who[0] ?? '',
    who_list: design.target_who.join(', '),
    what: design.target_what[0] ?? '',
    what_list: design.target_what.join(', '),
    when: design.target_when[0] ?? '',
    when_list: design.target_when.join(', '),
    tags: design.tags.join(', '),
  };
}

/**
 * Apply placeholders to a template string.
 * Unknown placeholders are left as-is (not removed).
 */
export function applyTemplate(
  template: string,
  placeholders: TemplatePlaceholders
): string {
  return template.replace(PLACEHOLDER_REGEX, (match, key: string) => {
    return key in placeholders ? placeholders[key] : match;
  });
}

/**
 * Extract all placeholder tokens from a template string.
 * Returns unique token names without the {{ }} wrapper.
 */
export function extractPlaceholders(template: string): string[] {
  const matches = new Set<string>();
  let match: RegExpExecArray | null;
  const regex = new RegExp(PLACEHOLDER_REGEX);

  while ((match = regex.exec(template)) !== null) {
    matches.add(match[1]);
  }

  return Array.from(matches);
}

/**
 * Validate that a template only uses known placeholders.
 * Returns unknown placeholder names, if any.
 */
export function validateTemplate(template: string): string[] {
  const known = new Set([
    'title', 'description', 'collection', 'slug',
    'who', 'who_list', 'what', 'what_list',
    'when', 'when_list', 'tags',
  ]);

  return extractPlaceholders(template).filter((p) => !known.has(p));
}
