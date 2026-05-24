import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  createDesignSchema,
  updateDesignSchema,
  createListingSchema,
  createExportSchema,
  createRunSchema,
  createTemplateSchema,
} from '@/lib/admin/validators/schemas';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'admin@syntaxpress.com',
      password: 'securepass123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'securepass123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@syntaxpress.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty fields', () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
    expect(loginSchema.safeParse({ email: '', password: '' }).success).toBe(false);
  });
});

describe('createDesignSchema', () => {
  const validDesign = {
    title: 'Sarcasm Loading',
    slug: 'sarcasm-loading',
  };

  it('accepts minimal valid input', () => {
    const result = createDesignSchema.safeParse(validDesign);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
      expect(result.data.target_who).toEqual([]);
    }
  });

  it('accepts full valid input', () => {
    const result = createDesignSchema.safeParse({
      ...validDesign,
      description: 'A loading bar for sarcasm',
      collection: 'Sarcastic Humor',
      tags: ['sarcasm', 'funny', 'tech'],
      target_who: ['tech workers', 'programmers'],
      target_what: ['t-shirt', 'mug'],
      target_when: ['anytime', 'coworker-gift'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createDesignSchema.safeParse({ ...validDesign, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid slug format', () => {
    const invalidSlugs = [
      'Has Spaces',
      'UPPERCASE',
      '-leading-hyphen',
      'trailing-hyphen-',
      'special@chars!',
    ];

    for (const slug of invalidSlugs) {
      const result = createDesignSchema.safeParse({ ...validDesign, slug });
      expect(result.success).toBe(false);
    }
  });

  it('accepts valid slug formats', () => {
    const validSlugs = [
      'simple',
      'hyphen-separated',
      'with-numbers-123',
      'a',
    ];

    for (const slug of validSlugs) {
      const result = createDesignSchema.safeParse({ ...validDesign, slug });
      expect(result.success).toBe(true);
    }
  });

  it('rejects too many tags', () => {
    const result = createDesignSchema.safeParse({
      ...validDesign,
      tags: Array.from({ length: 31 }, (_, i) => `tag-${i}`),
    });
    expect(result.success).toBe(false);
  });
});

describe('updateDesignSchema', () => {
  it('accepts partial updates', () => {
    expect(updateDesignSchema.safeParse({ title: 'New Title' }).success).toBe(true);
    expect(updateDesignSchema.safeParse({ status: 'published' }).success).toBe(true);
    expect(updateDesignSchema.safeParse({ tags: ['new-tag'] }).success).toBe(true);
    expect(updateDesignSchema.safeParse({}).success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = updateDesignSchema.safeParse({ status: 'bogus' });
    expect(result.success).toBe(false);
  });
});

describe('createListingSchema', () => {
  const validListing = {
    design_id: '550e8400-e29b-41d4-a716-446655440000',
    platform: 'etsy' as const,
    title: 'Funny Sarcasm T-Shirt',
    description: 'A hilarious tee for the sarcastic soul.',
    tags: ['funny', 'sarcasm', 'gift'],
  };

  it('accepts valid listing', () => {
    const result = createListingSchema.safeParse(validListing);
    expect(result.success).toBe(true);
  });

  it('rejects invalid platform', () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      platform: 'amazon',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-uuid design_id', () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      design_id: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 15 tags', () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      tags: Array.from({ length: 16 }, (_, i) => `tag-${i}`),
    });
    expect(result.success).toBe(false);
  });
});

describe('createExportSchema', () => {
  it('accepts valid export', () => {
    const result = createExportSchema.safeParse({
      design_id: '550e8400-e29b-41d4-a716-446655440000',
      platform: 'redbubble',
      file_path: '/designs/sarcasm-loading/redbubble-4500x5400.png',
      width: 4500,
      height: 5400,
      format: 'png',
    });
    expect(result.success).toBe(true);
  });

  it('rejects zero dimensions', () => {
    const result = createExportSchema.safeParse({
      design_id: '550e8400-e29b-41d4-a716-446655440000',
      platform: 'redbubble',
      file_path: '/test.png',
      width: 0,
      height: 5400,
    });
    expect(result.success).toBe(false);
  });
});

describe('createRunSchema', () => {
  it('accepts valid run', () => {
    const result = createRunSchema.safeParse({
      name: 'Spring 2026 Drop',
      target_platforms: ['shopify', 'etsy', 'redbubble'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createRunSchema.safeParse({
      name: '',
      target_platforms: ['shopify'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty platforms array', () => {
    const result = createRunSchema.safeParse({
      name: 'Test Run',
      target_platforms: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid platform', () => {
    const result = createRunSchema.safeParse({
      name: 'Test Run',
      target_platforms: ['amazon'],
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional description', () => {
    const result = createRunSchema.safeParse({
      name: 'Test Run',
      description: 'A test run with a description',
      target_platforms: ['shopify'],
    });
    expect(result.success).toBe(true);
  });
});

describe('createTemplateSchema', () => {
  it('accepts valid template', () => {
    const result = createTemplateSchema.safeParse({
      name: 'Standard Funny Tee',
      platform: 'etsy',
      title_template: '{{title}} Shirt | Funny {{who}} Gift',
      description_template: 'Looking for a gift for the {{who}}...',
      tag_template: '{{title}}, funny shirt, {{who}} gift',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = createTemplateSchema.safeParse({
      name: 'Test',
      platform: 'etsy',
    });
    expect(result.success).toBe(false);
  });
});
