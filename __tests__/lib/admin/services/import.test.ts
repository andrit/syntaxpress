import { describe, it, expect } from 'vitest';
import { matchDesignFiles, levenshteinDistance } from '@/lib/admin/services/import/file-matcher';
import {
  isDesignBatchSheet,
  isListingCopySheet,
  parseDesignBatchRows,
  parseListingCopyRows,
  mergeDesignAndListingData,
  rowToDesignInput,
} from '@/lib/admin/services/import/spreadsheet-parser';

// ──────────────────────────────────────────────
// File Matcher
// ──────────────────────────────────────────────

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
  });

  it('returns length for empty vs non-empty', () => {
    expect(levenshteinDistance('', 'hello')).toBe(5);
    expect(levenshteinDistance('abc', '')).toBe(3);
  });

  it('calculates correct distance', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    expect(levenshteinDistance('saturday', 'sunday')).toBe(3);
  });
});

describe('matchDesignFiles', () => {
  const fileNames = [
    'overthinking-champion_source.tiff',
    'introvert-battery_source.tiff',
    'fueled-by-coffee_source.tiff',
    'pro-overthinker_source.tiff',
    'reply-later_v2.tiff',
  ];

  it('matches by exact slug', () => {
    const results = matchDesignFiles(
      ['Overthinking Champion', 'Introvert Battery'],
      fileNames
    );

    expect(results[0].matchType).toBe('exact');
    expect(results[0].fileName).toBe('overthinking-champion_source.tiff');
    expect(results[0].confidence).toBe(1);

    expect(results[1].matchType).toBe('exact');
    expect(results[1].fileName).toBe('introvert-battery_source.tiff');
  });

  it('matches by filename pattern', () => {
    const patterns = new Map([
      ['professional overthinker', 'pro-overthinker_[platform]_[size].png'],
    ]);

    const results = matchDesignFiles(
      ['Professional Overthinker'],
      fileNames,
      patterns
    );

    expect(results[0].matchType).toBe('pattern');
    expect(results[0].fileName).toBe('pro-overthinker_source.tiff');
  });

  it('matches fuzzy when no exact or pattern match', () => {
    // "Fueled By Coffee" → slug "fueled-by-coffee"
    // File "fueled-coffee.tiff" → normalized "fueled-coffee"
    // Not a prefix match, but close enough for fuzzy (>60% similarity)
    const results = matchDesignFiles(
      ['Fueled By Coffee'],
      ['fueled-coffee.tiff']
    );

    expect(results[0].matchType).toBe('fuzzy');
    expect(results[0].confidence).toBeGreaterThan(0.6);
  });

  it('returns none when no match found', () => {
    const results = matchDesignFiles(
      ['Nonexistent Design'],
      fileNames
    );

    expect(results[0].matchType).toBe('none');
    expect(results[0].fileName).toBeNull();
    expect(results[0].confidence).toBe(0);
  });

  it('does not double-assign files', () => {
    const results = matchDesignFiles(
      ['Overthinking Champion', 'Overthinking Champ'],
      ['overthinking-champion_source.tiff']
    );

    // First gets exact match
    expect(results[0].matchType).toBe('exact');
    expect(results[0].fileName).toBe('overthinking-champion_source.tiff');

    // Second can't use same file
    expect(results[1].fileName).toBeNull();
  });
});

// ──────────────────────────────────────────────
// Spreadsheet Parser
// ──────────────────────────────────────────────

describe('isDesignBatchSheet', () => {
  it('detects design batch headers', () => {
    expect(isDesignBatchSheet({
      A: '#', B: 'Design Name', C: 'Text / Saying', D: 'Tone',
    })).toBe(true);
  });

  it('rejects sheets without design name', () => {
    expect(isDesignBatchSheet({
      A: 'Tool', B: 'Cost', C: 'Best For',
    })).toBe(false);
  });

  it('handles case-insensitive headers', () => {
    expect(isDesignBatchSheet({
      A: '#', B: 'DESIGN NAME', C: 'text/saying',
    })).toBe(true);
  });
});

describe('isListingCopySheet', () => {
  it('detects listing copy headers', () => {
    expect(isListingCopySheet({
      A: '#', B: 'Design Name', C: 'Etsy Title (140 char max)',
      D: 'Description', E: 'Tags',
    })).toBe(true);
  });

  it('rejects sheets with only design name but no listing fields', () => {
    expect(isListingCopySheet({
      A: '#', B: 'Design Name', C: 'Status',
    })).toBe(false);
  });
});

describe('parseDesignBatchRows', () => {
  const headers = {
    A: '#', B: 'Design Name', C: 'Text / Saying', D: 'Tone',
    E: 'Primary Product', F: 'Font Direction', G: 'Color Palette',
    H: 'Target Buyer', I: 'Status', J: 'Notes',
  };

  const dataRows = [
    { A: '1', B: 'Overthinking Champion', C: '"Overthinking Champion Since [Birth Year]"',
      D: 'Self-deprecating', E: 'T-shirt, Mug', H: 'Millennials, Gen Z' },
    { A: '2', B: 'Introvert Battery', C: '"My Social Battery Is at 2%"',
      D: 'Relatable introvert', E: 'T-shirt, Sticker', H: 'Introverts, WFH crowd' },
    { A: '3' }, // incomplete row — should be filtered out
  ];

  it('parses valid rows', () => {
    const result = parseDesignBatchRows(headers, dataRows);

    expect(result).toHaveLength(2);
    expect(result[0].design_name).toBe('Overthinking Champion');
    expect(result[0].primary_product).toBe('T-shirt, Mug');
    expect(result[0].target_buyer).toBe('Millennials, Gen Z');
  });

  it('filters out rows without design_name', () => {
    const result = parseDesignBatchRows(headers, dataRows);
    expect(result.every((r) => r.design_name)).toBe(true);
  });
});

describe('parseListingCopyRows', () => {
  const headers = {
    A: '#', B: 'Design Name', C: 'Etsy Title (140 char max)',
    D: 'Description (First 2 sentences)', E: 'Tags (13 tags)',
    F: 'Redbubble Title',
  };

  const dataRows = [
    {
      A: '1', B: 'Overthinking Champion',
      C: 'Overthinking Champion Funny T-Shirt — Sarcastic Tee',
      D: 'This sarcastic tee is perfect for anyone.',
      E: 'funny shirt, overthinking, anxiety humor',
      F: 'Overthinking Champion Funny Sarcastic Tee',
    },
  ];

  it('returns a map keyed by lowercase design name', () => {
    const result = parseListingCopyRows(headers, dataRows);

    expect(result.has('overthinking champion')).toBe(true);
    const entry = result.get('overthinking champion');
    expect(entry?.etsy_title).toBe('Overthinking Champion Funny T-Shirt — Sarcastic Tee');
    expect(entry?.redbubble_title).toBe('Overthinking Champion Funny Sarcastic Tee');
  });
});

describe('mergeDesignAndListingData', () => {
  it('merges batch rows with listing copy by name', () => {
    const batchRows = [{ design_name: 'Overthinking Champion', tone: 'Sarcastic' }];
    const listingCopy = new Map([
      ['overthinking champion', {
        design_name: 'Overthinking Champion',
        etsy_title: 'Funny Tee',
        etsy_tags: 'funny, sarcasm',
      }],
    ]);

    const result = mergeDesignAndListingData(batchRows, listingCopy);

    expect(result).toHaveLength(1);
    expect(result[0].design_name).toBe('Overthinking Champion');
    expect(result[0].tone).toBe('Sarcastic');
    expect(result[0].etsy_title).toBe('Funny Tee');
  });

  it('handles rows with no matching listing copy', () => {
    const batchRows = [{ design_name: 'New Design' }];
    const result = mergeDesignAndListingData(batchRows, new Map());

    expect(result[0].design_name).toBe('New Design');
    expect(result[0].etsy_title).toBeUndefined();
  });
});

describe('rowToDesignInput', () => {
  it('converts an imported row to design input', () => {
    const row = {
      design_name: 'Overthinking Champion',
      text_saying: '"Overthinking Champion Since Birth"',
      tone: 'Self-deprecating, Dry humor',
      primary_product: 'T-shirt, Mug',
      target_buyer: 'Millennials, Gen Z',
    };

    const result = rowToDesignInput(row);

    expect(result.title).toBe('Overthinking Champion');
    expect(result.slug).toBe('overthinking-champion');
    expect(result.description).toBe('"Overthinking Champion Since Birth"');
    expect(result.tags).toEqual(['Self-deprecating', 'Dry humor']);
    expect(result.target_who).toEqual(['Millennials', 'Gen Z']);
    expect(result.target_what).toEqual(['T-shirt', 'Mug']);
  });

  it('handles missing optional fields', () => {
    const row = { design_name: 'Simple Design' };
    const result = rowToDesignInput(row);

    expect(result.title).toBe('Simple Design');
    expect(result.slug).toBe('simple-design');
    expect(result.tags).toEqual([]);
    expect(result.target_who).toEqual([]);
    expect(result.target_what).toEqual([]);
  });
});
