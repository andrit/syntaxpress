import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

// ──────────────────────────────────────────────
// Shopify Webhook → Revalidate Cache
// ──────────────────────────────────────────────
// Register this URL as a webhook in Shopify:
// POST https://your-domain.com/api/revalidate
//
// Topics to subscribe:
//   products/create, products/update, products/delete
//   collections/create, collections/update, collections/delete

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidation-secret');

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const topic = request.headers.get('x-shopify-topic') ?? '';

    // Determine which cache tags to invalidate
    const tagsToRevalidate: string[] = [];

    if (topic.startsWith('products/')) {
      tagsToRevalidate.push('products');
      if (body.handle) {
        tagsToRevalidate.push(`product-${body.handle}`);
      }
    }

    if (topic.startsWith('collections/')) {
      tagsToRevalidate.push('collections');
      if (body.handle) {
        tagsToRevalidate.push(`collection-${body.handle}`);
      }
    }

    // Revalidate all matched tags
    for (const tag of tagsToRevalidate) {
      revalidateTag(tag);
    }

    return NextResponse.json({
      revalidated: true,
      tags: tagsToRevalidate,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}
