import { describe, it, expect } from 'vitest';
import {
  applyTemplate,
  buildPlaceholders,
  extractPlaceholders,
  validateTemplate,
} from '@/lib/admin/services/template-engine';
import type { Design } from '@/lib/admin/repositories';

const mockDesign: Design = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Sarcasm Loading',
  slug: 'sarcasm-loading',
  description: 'A loading bar for sarcasm',
  collection: 'Sarcastic Humor',
  tags: ['sarcasm', 'funny', 'tech'],
  target_who: ['programmers', 'tech workers'],
  target_what: ['t-shirt', 'mug'],
  target_when: ['birthday', 'coworker-gift'],
  status: 'draft',
  source_file_path: null,
  created_by: 'user-123',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('buildPlaceholders', () => {
  it('builds all placeholders from a design', () => {
    const p = buildPlaceholders(mockDesign);

    expect(p.title).toBe('Sarcasm Loading');
    expect(p.slug).toBe('sarcasm-loading');
    expect(p.description).toBe('A loading bar for sarcasm');
    expect(p.collection).toBe('Sarcastic Humor');
    expect(p.who).toBe('programmers');
    expect(p.who_list).toBe('programmers, tech workers');
    expect(p.what).toBe('t-shirt');
    expect(p.when).toBe('birthday');
    expect(p.when_list).toBe('birthday, coworker-gift');
    expect(p.tags).toBe('sarcasm, funny, tech');
  });

  it('handles missing optional fields gracefully', () => {
    const sparse: Design = {
      ...mockDesign,
      description: null,
      collection: null,
      target_who: [],
      target_what: [],
      target_when: [],
      tags: [],
    };

    const p = buildPlaceholders(sparse);
    expect(p.description).toBe('');
    expect(p.collection).toBe('');
    expect(p.who).toBe('');
    expect(p.who_list).toBe('');
    expect(p.tags).toBe('');
  });
});

describe('applyTemplate', () => {
  it('replaces all known placeholders', () => {
    const template = '{{title}} Shirt | Gift for {{who}} | {{collection}} Tee';
    const placeholders = buildPlaceholders(mockDesign);

    const result = applyTemplate(template, placeholders);

    expect(result).toBe('Sarcasm Loading Shirt | Gift for programmers | Sarcastic Humor Tee');
  });

  it('leaves unknown placeholders untouched', () => {
    const template = '{{title}} — {{unknown_field}}';
    const placeholders = buildPlaceholders(mockDesign);

    const result = applyTemplate(template, placeholders);

    expect(result).toBe('Sarcasm Loading — {{unknown_field}}');
  });

  it('handles template with no placeholders', () => {
    const result = applyTemplate('Just plain text', {});
    expect(result).toBe('Just plain text');
  });

  it('handles multiple occurrences of same placeholder', () => {
    const template = '{{who}} loves {{who}} things';
    const result = applyTemplate(template, { who: 'programmers' });
    expect(result).toBe('programmers loves programmers things');
  });
});

describe('extractPlaceholders', () => {
  it('extracts all unique placeholder names', () => {
    const template = '{{title}} for {{who}} — {{title}} again and {{when}}';
    const result = extractPlaceholders(template);

    expect(result).toContain('title');
    expect(result).toContain('who');
    expect(result).toContain('when');
    expect(result).toHaveLength(3); // unique
  });

  it('returns empty array for no placeholders', () => {
    expect(extractPlaceholders('no placeholders here')).toEqual([]);
  });
});

describe('validateTemplate', () => {
  it('returns empty array for valid templates', () => {
    const template = '{{title}} | {{who}} | {{collection}}';
    expect(validateTemplate(template)).toEqual([]);
  });

  it('returns unknown placeholder names', () => {
    const template = '{{title}} | {{custom_field}} | {{another}}';
    const unknowns = validateTemplate(template);

    expect(unknowns).toContain('custom_field');
    expect(unknowns).toContain('another');
    expect(unknowns).not.toContain('title');
  });
});
