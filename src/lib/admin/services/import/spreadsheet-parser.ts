import { ImportedDesignRow } from '@/lib/admin/validators/schemas';
import { DesignService } from '../design.service';

// ──────────────────────────────────────────────
// Spreadsheet Parser
// ──────────────────────────────────────────────
// Parses an Excel workbook (via SheetJS/xlsx) into
// ImportedDesignRow[] objects. Detects sheets by header
// structure, not by name. Unknown sheets are ignored.

export type SheetRow = Record<string, string | number | null | undefined>;

/**
 * Known column header patterns → internal field mapping.
 * Each entry: [regex to match header text, internal field name]
 */
const DESIGN_BATCH_COLUMNS: [RegExp, keyof ImportedDesignRow][] = [
  [/design\s*name/i, 'design_name'],
  [/text\s*[/|]\s*saying/i, 'text_saying'],
  [/tone/i, 'tone'],
  [/primary\s*product/i, 'primary_product'],
  [/font\s*direction/i, 'font_direction'],
  [/colou?r\s*palette/i, 'color_palette'],
  [/target\s*buyer/i, 'target_buyer'],
  [/notes?/i, 'notes'],
  [/filename\s*pattern/i, 'filename_pattern'],
];

const LISTING_COPY_COLUMNS: [RegExp, keyof ImportedDesignRow][] = [
  [/design\s*name/i, 'design_name'],
  [/etsy\s*title/i, 'etsy_title'],
  [/description/i, 'etsy_description'],
  [/tags/i, 'etsy_tags'],
  [/redbubble\s*title/i, 'redbubble_title'],
];

/**
 * Detect which columns in a sheet match our expected headers.
 * Returns a map of column key (from SheetJS) → internal field name.
 */
function detectColumns(
  headers: SheetRow,
  patterns: [RegExp, keyof ImportedDesignRow][]
): Map<string, keyof ImportedDesignRow> {
  const mapping = new Map<string, keyof ImportedDesignRow>();

  for (const [columnKey, headerValue] of Object.entries(headers)) {
    if (typeof headerValue !== 'string') continue;
    const cleaned = headerValue.trim();

    for (const [regex, fieldName] of patterns) {
      if (regex.test(cleaned) && !mapping.has(columnKey)) {
        mapping.set(columnKey, fieldName);
        break;
      }
    }
  }

  return mapping;
}

/**
 * Check if a sheet's headers match the Design Batch pattern.
 * Requires at least "design_name" to be present.
 */
export function isDesignBatchSheet(headers: SheetRow): boolean {
  const mapping = detectColumns(headers, DESIGN_BATCH_COLUMNS);
  return Array.from(mapping.values()).includes('design_name');
}

/**
 * Check if a sheet's headers match the Listing Copy pattern.
 * Requires "design_name" + at least one listing field.
 */
export function isListingCopySheet(headers: SheetRow): boolean {
  const mapping = detectColumns(headers, LISTING_COPY_COLUMNS);
  const fields = Array.from(mapping.values());
  return (
    fields.includes('design_name') &&
    (fields.includes('etsy_title') || fields.includes('etsy_description') || fields.includes('etsy_tags'))
  );
}

/**
 * Parse rows from a design batch sheet into partial ImportedDesignRow objects.
 */
export function parseDesignBatchRows(
  headerRow: SheetRow,
  dataRows: SheetRow[]
): Partial<ImportedDesignRow>[] {
  const mapping = detectColumns(headerRow, DESIGN_BATCH_COLUMNS);
  if (!mapping.size) return [];

  return dataRows
    .map((row) => {
      const result: Partial<ImportedDesignRow> = {};

      for (const [colKey, fieldName] of mapping) {
        const value = row[colKey];
        if (value != null && value !== '') {
          result[fieldName] = String(value).trim();
        }
      }

      return result;
    })
    .filter((row) => row.design_name);
}

/**
 * Parse rows from a listing copy sheet and merge into existing rows.
 */
export function parseListingCopyRows(
  headerRow: SheetRow,
  dataRows: SheetRow[]
): Map<string, Partial<ImportedDesignRow>> {
  const mapping = detectColumns(headerRow, LISTING_COPY_COLUMNS);
  if (!mapping.size) return new Map();

  const result = new Map<string, Partial<ImportedDesignRow>>();

  for (const row of dataRows) {
    const partial: Partial<ImportedDesignRow> = {};

    for (const [colKey, fieldName] of mapping) {
      const value = row[colKey];
      if (value != null && value !== '') {
        partial[fieldName] = String(value).trim();
      }
    }

    if (partial.design_name) {
      result.set(partial.design_name.toLowerCase(), partial);
    }
  }

  return result;
}

/**
 * Merge design batch rows with listing copy data.
 * Matches by normalized design name.
 */
export function mergeDesignAndListingData(
  batchRows: Partial<ImportedDesignRow>[],
  listingCopy: Map<string, Partial<ImportedDesignRow>>
): ImportedDesignRow[] {
  return batchRows.map((batchRow) => {
    const name = batchRow.design_name?.toLowerCase() ?? '';
    const copyData = listingCopy.get(name) ?? {};

    const merged: ImportedDesignRow = {
      design_name: batchRow.design_name ?? '',
      text_saying: batchRow.text_saying ?? copyData.text_saying,
      tone: batchRow.tone,
      primary_product: batchRow.primary_product,
      font_direction: batchRow.font_direction,
      color_palette: batchRow.color_palette,
      target_buyer: batchRow.target_buyer,
      filename_pattern: batchRow.filename_pattern,
      notes: batchRow.notes,
      etsy_title: copyData.etsy_title,
      etsy_description: copyData.etsy_description,
      etsy_tags: copyData.etsy_tags,
      redbubble_title: copyData.redbubble_title,
    };

    return merged;
  });
}

/**
 * Convert an imported row to a CreateDesignInput-compatible object.
 */
export function rowToDesignInput(row: ImportedDesignRow) {
  const slug = DesignService.generateSlug(row.design_name);
  const tags: string[] = [];

  if (row.tone) tags.push(...row.tone.split(/[,;]+/).map((t) => t.trim()).filter(Boolean));

  const targetWho = row.target_buyer
    ? row.target_buyer.split(/[,;]+/).map((t) => t.trim()).filter(Boolean)
    : [];

  const targetWhat = row.primary_product
    ? row.primary_product.split(/[,;]+/).map((t) => t.trim()).filter(Boolean)
    : [];

  return {
    title: row.design_name,
    slug,
    description: row.text_saying ?? null,
    tags,
    target_who: targetWho,
    target_what: targetWhat,
    target_when: [] as string[],
  };
}
