import { z } from 'zod';

// ──────────────────────────────────────────────
// Shared enums
// ──────────────────────────────────────────────

export const designStatusEnum = z.enum(['draft', 'staged', 'published', 'archived']);
export const listingStatusEnum = z.enum(['draft', 'ready', 'published', 'failed']);
export const platformEnum = z.enum(['shopify', 'etsy', 'redbubble', 'teepublic', 'society6', 'zazzle']);
export const adminRoleEnum = z.enum(['owner', 'editor', 'viewer']);
export const runStatusEnum = z.enum(['planning', 'in_progress', 'completed', 'archived']);

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ──────────────────────────────────────────────
// Design
// ──────────────────────────────────────────────

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createDesignSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().regex(slugRegex, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(2000).nullable().optional(),
  collection: z.string().max(100).nullable().optional(),
  tags: z.array(z.string().max(50)).max(30).default([]),
  target_who: z.array(z.string().max(50)).max(20).default([]),
  target_what: z.array(z.string().max(50)).max(20).default([]),
  target_when: z.array(z.string().max(50)).max(20).default([]),
});

export const updateDesignSchema = createDesignSchema.partial().extend({
  status: designStatusEnum.optional(),
});

export type CreateDesignInput = z.infer<typeof createDesignSchema>;
export type UpdateDesignInput = z.infer<typeof updateDesignSchema>;

// ──────────────────────────────────────────────
// Platform Listing
// ──────────────────────────────────────────────

export const createListingSchema = z.object({
  design_id: z.string().uuid(),
  platform: platformEnum,
  title: z.string().min(1).max(300),
  description: z.string().min(1).max(5000),
  tags: z.array(z.string().max(50)).max(15).default([]),
});

export const updateListingSchema = createListingSchema.partial().omit({
  design_id: true,
  platform: true,
}).extend({
  status: listingStatusEnum.optional(),
  external_id: z.string().nullable().optional(),
  external_url: z.string().url().nullable().optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;

// ──────────────────────────────────────────────
// Design Export
// ──────────────────────────────────────────────

export const createExportSchema = z.object({
  design_id: z.string().uuid(),
  platform: platformEnum,
  file_path: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  format: z.string().default('png'),
});

export type CreateExportInput = z.infer<typeof createExportSchema>;

// ──────────────────────────────────────────────
// Run
// ──────────────────────────────────────────────

export const createRunSchema = z.object({
  name: z.string().min(1, 'Run name is required').max(200),
  description: z.string().max(2000).nullable().optional(),
  target_platforms: z.array(platformEnum).min(1, 'Select at least one platform'),
});

export const updateRunSchema = createRunSchema.partial().extend({
  status: runStatusEnum.optional(),
});

export type CreateRunInput = z.infer<typeof createRunSchema>;
export type UpdateRunInput = z.infer<typeof updateRunSchema>;

// ──────────────────────────────────────────────
// Listing Template
// ──────────────────────────────────────────────

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  platform: platformEnum,
  product_type: z.string().max(100).nullable().optional(),
  collection: z.string().max(100).nullable().optional(),
  is_default: z.boolean().default(false),
  title_template: z.string().min(1).max(500),
  description_template: z.string().min(1).max(5000),
  tag_template: z.string().min(1).max(2000),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

// ──────────────────────────────────────────────
// Import — parsed spreadsheet row
// ──────────────────────────────────────────────

export const importedDesignRowSchema = z.object({
  design_name: z.string().min(1),
  text_saying: z.string().optional(),
  tone: z.string().optional(),
  primary_product: z.string().optional(),
  font_direction: z.string().optional(),
  color_palette: z.string().optional(),
  target_buyer: z.string().optional(),
  filename_pattern: z.string().optional(),
  notes: z.string().optional(),
  // Listing copy (optional — from Listing Copy sheet)
  etsy_title: z.string().optional(),
  etsy_description: z.string().optional(),
  etsy_tags: z.string().optional(),
  redbubble_title: z.string().optional(),
});

export type ImportedDesignRow = z.infer<typeof importedDesignRowSchema>;

